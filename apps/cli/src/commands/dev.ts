import { defineCommand } from 'citty';
import consola from 'consola';

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
            description: 'Port for the local dev server',
            default: '3000'
        },
        tunnel: {
            type: 'string',
            description: 'Tunnel provider (cloudflare, ngrok)',
            default: 'cloudflare'
        }
    },
    async run({ args }) {
        consola.info(`Starting dev server on port ${args.port}...`);
        consola.info(`Tunnel provider: ${args.tunnel}`);
        consola.warn('Not yet implemented — coming soon!');
    }
});
