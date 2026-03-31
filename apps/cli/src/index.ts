import { defineCommand, runMain } from 'citty';
import { getCliVersion } from './utils/version.js';

import { initCommand } from './commands/init.js';
import { devCommand } from './commands/dev.js';
import { webhooksCommand } from './commands/webhooks/index.js';
import { logsCommand } from './commands/logs.js';
import { telemetryCommand } from './commands/telemetry.js';
import {
    initSentry,
    flushSentry,
    captureException,
    showTelemetryNotice,
    trackEvent
} from './telemetry/index.js';

// ─── Bootstrap crash reporting ───
initSentry();
showTelemetryNotice();

const main = defineCommand({
    meta: {
        name: 'ghl',
        version: getCliVersion(),
        description:
            'GHL Marketplace Developer CLI — scaffolding, local dev, webhook testing, and log streaming'
    },
    subCommands: {
        init: initCommand,
        dev: devCommand,
        webhooks: webhooksCommand,
        logs: logsCommand,
        telemetry: telemetryCommand
    }
});

// ─── Track command invocations and crashes ───
const args = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
const commandName = args[0] ?? 'help';
const subCommandName = args[1];
const fullCommand = args.join(' ') || 'help';

trackEvent('command:invoked', {
    command: fullCommand,
    baseCommand: commandName,
    subcommand: subCommandName
});

runMain(main).catch(async (err: unknown) => {
    captureException(err);
    trackEvent('command:error', {
        command: fullCommand,
        baseCommand: commandName,
        subcommand: subCommandName,
        error: err instanceof Error ? err.message : String(err)
    });
    await flushSentry();
    process.exitCode = 1;
});
