import { defineCommand } from 'citty';
import consola from 'consola';

export const initCommand = defineCommand({
    meta: {
        name: 'init',
        description: 'Scaffold a new GHL Marketplace app'
    },
    args: {
        name: {
            type: 'positional',
            description: 'Name of the app to create',
            required: false
        },
        template: {
            type: 'string',
            alias: 't',
            description:
                'Template to use (custom-pages, workflow-actions, full)',
            default: 'custom-pages'
        }
    },
    async run({ args }) {
        consola.info(
            `Scaffolding new GHL Marketplace app: ${args.name ?? 'my-ghl-app'}`
        );
        consola.warn('Not yet implemented — coming soon!');
    }
});
