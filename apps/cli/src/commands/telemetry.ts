// oxlint-disable no-console
import { defineCommand } from 'citty';
import pc from 'picocolors';

import {
    isTelemetryEnabled,
    setTelemetryEnabled,
} from '../telemetry/index.js';

export const telemetryCommand = defineCommand({
    meta: {
        name: 'telemetry',
        description: 'Manage anonymous usage telemetry',
    },
    subCommands: {
        status: defineCommand({
            meta: {
                name: 'status',
                description: 'Show current telemetry status',
            },
            run() {
                const enabled = isTelemetryEnabled();
                console.log(
                    `\n  Telemetry is ${enabled ? pc.green('enabled') : pc.red('disabled')}.\n`,
                );
            },
        }),
        enable: defineCommand({
            meta: {
                name: 'enable',
                description: 'Enable anonymous usage telemetry',
            },
            run() {
                setTelemetryEnabled(true);
                console.log(
                    `\n  ${pc.green('✔')} Telemetry ${pc.bold('enabled')}. Thank you for helping improve ghl-cli!\n`,
                );
            },
        }),
        disable: defineCommand({
            meta: {
                name: 'disable',
                description: 'Disable anonymous usage telemetry',
            },
            run() {
                setTelemetryEnabled(false);
                console.log(
                    `\n  ${pc.green('✔')} Telemetry ${pc.bold('disabled')}. No data will be collected.\n`,
                );
            },
        }),
    },
});
