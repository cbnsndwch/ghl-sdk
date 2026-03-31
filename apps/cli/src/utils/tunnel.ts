import {
    execSync,
    spawn,
    spawnSync,
    type ChildProcess
} from 'node:child_process';
import { platform } from 'node:os';

import * as p from '@clack/prompts';

import consola from 'consola';

export type TunnelProvider = 'cloudflare' | 'ngrok';

export interface TunnelResult {
    url: string;
    process: ChildProcess;
    stop: () => void;
}

export async function ensureCloudflaredInstalled(
    spinner?: ReturnType<typeof p.spinner>
): Promise<boolean> {
    const { error } = spawnSync('cloudflared', ['--version']);
    if (!error) return true;

    // missing
    if (spinner)
        spinner.stop(
            'cloudflared is required for the tunnel but not installed.'
        );
    const install = await p.confirm({
        message: 'Would you like to install it now?',
        initialValue: true
    });

    if (!install || p.isCancel(install)) {
        throw new Error('cloudflared not installed');
    }

    const s = p.spinner();
    s.start('Installing cloudflared...');

    try {
        if (platform() === 'darwin') {
            execSync('brew install cloudflare/cloudflare/cloudflared', {
                stdio: 'pipe'
            });
        } else if (platform() === 'win32') {
            execSync(
                'winget install --id Cloudflare.cloudflared --accept-package-agreements --accept-source-agreements',
                { stdio: 'pipe' }
            );
        } else {
            s.stop('Manual installation required');
            throw new Error(
                'Please install cloudflared manually: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/'
            );
        }
        s.stop('cloudflared installed successfully!');
        if (spinner) spinner.start('Resuming tunnel connection...');
        return true;
    } catch (err: any) {
        s.stop('Installation failed');
        throw new Error(`Failed to install cloudflared: ${err.message}`);
    }
}

/**
 * Start a Cloudflare Quick Tunnel (no account required).
 * Reads the tunnel URL from the cloudflared stderr output.
 */
async function startCloudflareTunnel(
    port: number,
    spinner?: ReturnType<typeof p.spinner>
): Promise<TunnelResult> {
    await ensureCloudflaredInstalled(spinner);

    const child = spawn(
        'cloudflared',
        ['tunnel', '--url', `http://localhost:${port}`],
        {
            stdio: ['ignore', 'pipe', 'pipe']
        }
    );

    const url = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(
                new Error(
                    'Timed out waiting for Cloudflare tunnel URL (30s). Is cloudflared installed?'
                )
            );
        }, 30_000);

        const onData = (chunk: Buffer) => {
            const text = chunk.toString();
            // cloudflared prints the URL on stderr like:
            // "... https://xxxxx.trycloudflare.com ..."
            const match = text.match(
                /https:\/\/[a-z0-9-]+\.trycloudflare\.com/
            );
            if (match) {
                clearTimeout(timeout);
                child.stderr?.off('data', onData);
                resolve(match[0]);
            }
        };

        child.stderr?.on('data', onData);
        // Also check stdout just in case
        child.stdout?.on('data', onData);

        child.on('error', err => {
            clearTimeout(timeout);
            reject(
                new Error(
                    `Failed to start cloudflared: ${err.message}. Install it from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/`
                )
            );
        });

        child.on('exit', code => {
            clearTimeout(timeout);
            if (code !== 0 && code !== null) {
                reject(new Error(`cloudflared exited with code ${code}`));
            }
        });
    });

    return {
        url,
        process: child,
        stop: () => {
            child.kill('SIGTERM');
        }
    };
}

/**
 * Start an ngrok tunnel.
 */
async function startNgrokTunnel(port: number): Promise<TunnelResult> {
    const child = spawn(
        'ngrok',
        ['http', String(port), '--log', 'stdout', '--log-format', 'json'],
        {
            stdio: ['ignore', 'pipe', 'pipe']
        }
    );

    const url = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(
                new Error(
                    'Timed out waiting for ngrok tunnel URL (30s). Is ngrok installed and authenticated?'
                )
            );
        }, 30_000);

        child.stdout?.on('data', (chunk: Buffer) => {
            const text = chunk.toString();
            // ngrok JSON log format: {"url":"https://xxxx.ngrok-free.app",...}
            for (const line of text.split('\n')) {
                try {
                    const log = JSON.parse(line);
                    if (log.url && log.url.startsWith('https://')) {
                        clearTimeout(timeout);
                        resolve(log.url);
                        return;
                    }
                } catch {
                    // Not JSON, try regex
                    const match = line.match(
                        /https:\/\/[a-z0-9-]+\.ngrok[a-z-]*\.(app|io)/
                    );
                    if (match) {
                        clearTimeout(timeout);
                        resolve(match[0]);
                        return;
                    }
                }
            }
        });

        child.on('error', err => {
            clearTimeout(timeout);
            reject(
                new Error(
                    `Failed to start ngrok: ${err.message}. Install it from https://ngrok.com/download`
                )
            );
        });

        child.on('exit', code => {
            clearTimeout(timeout);
            if (code !== 0 && code !== null) {
                reject(new Error(`ngrok exited with code ${code}`));
            }
        });
    });

    return {
        url,
        process: child,
        stop: () => {
            child.kill('SIGTERM');
        }
    };
}

/**
 * Start a tunnel with fallback.
 * Tries the preferred provider first, then falls back to the other.
 */
export async function startTunnel(
    port: number,
    preferred: TunnelProvider = 'cloudflare',
    spinner?: ReturnType<typeof p.spinner>
): Promise<TunnelResult> {
    const providers: Record<TunnelProvider, () => Promise<TunnelResult>> = {
        cloudflare: () => startCloudflareTunnel(port, spinner),
        ngrok: () => startNgrokTunnel(port)
    };

    const fallback: TunnelProvider =
        preferred === 'cloudflare' ? 'ngrok' : 'cloudflare';

    try {
        return await providers[preferred]();
    } catch (err) {
        consola.warn(
            `${preferred} tunnel failed: ${err instanceof Error ? err.message : err}`
        );
        consola.info(`Falling back to ${fallback}...`);

        return await providers[fallback]();
    }
}
