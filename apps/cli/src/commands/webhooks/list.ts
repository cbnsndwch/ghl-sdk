import { defineCommand } from 'citty';
import consola from 'consola';

export const listCommand = defineCommand({
    meta: {
        name: 'list',
        description: 'List all available GHL webhook event types'
    },
    args: {},
    async run() {
        consola.info('Available GHL Webhook Event Types:');
        consola.warn('Not yet implemented — coming soon!');
    }
});
