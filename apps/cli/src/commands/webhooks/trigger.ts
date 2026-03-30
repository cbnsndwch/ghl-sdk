import { defineCommand } from 'citty';
import consola from 'consola';

export const triggerCommand = defineCommand({
    meta: {
        name: 'trigger',
        description: 'Send a test webhook event to your endpoint'
    },
    args: {
        event: {
            type: 'positional',
            description:
                'Webhook event type (e.g. ContactCreate, AppointmentCreate)',
            required: true
        },
        url: {
            type: 'string',
            alias: 'u',
            description: 'Target URL to send the webhook to',
            default: 'http://localhost:3000/webhooks'
        }
    },
    async run({ args }) {
        consola.info(`Triggering ${args.event} webhook → ${args.url}`);
        consola.warn('Not yet implemented — coming soon!');
    }
});
