import { defineCommand } from 'citty';

import { triggerCommand } from './trigger.js';
import { listCommand } from './list.js';
import { replayCommand } from './replay.js';

export const webhooksCommand = defineCommand({
    meta: {
        name: 'webhooks',
        description: 'Webhook testing and debugging tools'
    },
    subCommands: {
        trigger: triggerCommand,
        list: listCommand,
        replay: replayCommand
    }
});
