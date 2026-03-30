import { defineCommand } from 'citty';
import pc from 'picocolors';
import * as p from '@clack/prompts';

import { tryLoadConfig, type GhlConfig } from '../config.js';
import { startDevServer } from '../utils/process.js';
import { startTunnel, type TunnelProvider } from '../utils/tunnel.js';
import { kvLine } from '../utils/formatting.js';
import { trackEvent } from '../telemetry/index.js';

export const devCommand = defineCommand({
    meta: {
        name: 'dev',
        description:
            'Start local dev server with HTTPS tunnel for GHL app development'
    },
    args: {
        port: {
            type: 'string',
            alias: 'p',
            description: 'Port for the local dev server'
        },
        tunnel: {
            type: 'string',
            description: 'Tunnel provider (cloudflare, ngrok)'
        },
        'no-tunnel': {
            type: 'boolean',
            description: 'Skip tunnel creation',
            default: false
        }
    },
    async run({ args }) {
        p.intro(pc.bgCyan(pc.black(' ghl dev ')));

        // ─── Load config ───
        const config = await tryLoadConfig();
        const port = Number(args.port) || config?.port || 3000;
        const tunnelProvider = (args.tunnel ||
            config?.tunnel ||
            'cloudflare') as TunnelProvider;
        const skipTunnel = args['no-tunnel'] as boolean;

        // ─── Start dev server ───
        const serverSpinner = p.spinner();
        serverSpinner.start('Starting local dev server...');

        const server = await startDevServer(process.cwd(), port);

        serverSpinner.stop(`Dev server started (${server.framework})`);

        // ─── Start tunnel ───
        let tunnelUrl = '';
        let tunnelStop: (() => void) | undefined;

        if (!skipTunnel) {
            const tunnelSpinner = p.spinner();
            tunnelSpinner.start(`Establishing ${tunnelProvider} tunnel...`);

            try {
                const tunnel = await startTunnel(port, tunnelProvider);
                tunnelUrl = tunnel.url;
                tunnelStop = tunnel.stop;
                tunnelSpinner.stop('Tunnel established!');
            } catch (err) {
                tunnelSpinner.stop('Tunnel failed');
                p.log.warn(
                    `Could not establish tunnel: ${err instanceof Error ? err.message : err}`
                );
                p.log.info(
                    'Continuing without tunnel. Your app is only accessible locally.'
                );
            }
        }

        // ─── Print connection info ───
        const webhookPath = config?.webhookPath ?? '/webhooks';

        p.note(
            [
                kvLine('App URL:', `http://localhost:${port}`),
                tunnelUrl ? kvLine('Tunnel URL:', pc.cyan(tunnelUrl)) : '',
                tunnelUrl
                    ? kvLine(
                          'Webhook URL:',
                          pc.cyan(`${tunnelUrl}${webhookPath}`)
                      )
                    : '',
                '',
                `  ${pc.dim('⚡ Watching for file changes...')}`
            ]
                .filter(Boolean)
                .join('\n'),
            'Development Server'
        );

        if (tunnelUrl) {
            p.log.info(
                `${pc.yellow('💡 Tip:')} Configure ${pc.cyan(tunnelUrl)} as your redirect URL\n   in the GHL Developer Portal for your sandbox app.`
            );
        }

        trackEvent('dev:started', {
            framework: server.framework,
            port,
            tunnel: skipTunnel ? 'none' : tunnelProvider,
            tunnelSuccess: !!tunnelUrl
        });

        // ─── Graceful shutdown ───
        const cleanup = () => {
            p.log.info('\nShutting down...');
            server.stop();
            tunnelStop?.();
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

        // Keep alive
        await new Promise(() => {});
    }
});
