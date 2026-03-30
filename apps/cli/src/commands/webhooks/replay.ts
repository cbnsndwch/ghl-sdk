import { defineCommand } from 'citty';
import consola from 'consola';

export const replayCommand = defineCommand({
    meta: {
        name: 'replay',
        description: 'Replay a webhook event from GHL logs'
    },
    args: {
        webhookId: {
            type: 'string',
            alias: 'id',
            description: 'The webhook ID to replay',
            required: true
        },
        url: {
            type: 'string',
            alias: 'u',
            description: 'Target URL to send the replayed webhook to',
            default: 'http://localhost:3000/webhooks'
        }
    },
    async run({ args }) {
        consola.info(`Replaying webhook ${args.webhookId} → ${args.url}`);
        consola.warn('Not yet implemented — coming soon!');
    }
});
