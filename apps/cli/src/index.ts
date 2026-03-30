import { defineCommand, runMain } from 'citty';

import { initCommand } from './commands/init.js';
import { devCommand } from './commands/dev.js';
import { webhooksCommand } from './commands/webhooks/index.js';
import { logsCommand } from './commands/logs.js';

const main = defineCommand({
    meta: {
        name: 'ghl',
        version: '0.1.0',
        description:
            'GHL Marketplace Developer CLI — scaffolding, local dev, webhook testing, and log streaming'
    },
    subCommands: {
        init: initCommand,
        dev: devCommand,
        webhooks: webhooksCommand,
        logs: logsCommand
    }
});

runMain(main);
