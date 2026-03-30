import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

let cachedVersion: string | null = null;

export function getCliVersion(): string {
    if (cachedVersion) {
        return cachedVersion;
    }

    if (process.env.CLI_VERSION) {
        cachedVersion = process.env.CLI_VERSION;
        return cachedVersion;
    }

    try {
        const require = createRequire(import.meta.url);
        const pkg = require('../../package.json') as { version: string };
        const gitHash = execSync('git rev-parse --short HEAD', {
            stdio: 'pipe'
        })
            .toString()
            .trim();
        cachedVersion = `${pkg.version} (${gitHash})`;
    } catch {
        try {
            const require = createRequire(import.meta.url);
            const pkg = require('../../package.json') as { version: string };
            cachedVersion = `${pkg.version} (unknown)`;
        } catch {
            cachedVersion = 'unknown';
        }
    }

    return cachedVersion;
}
