import { randomUUID } from 'node:crypto';

import { isCI as IS_CI } from 'ci-info';
import consola from 'consola';

import { getCliVersion } from '../utils/version.js';

import { getMachineId, isTelemetryEnabled } from './config.js';

const debug = consola.withTag('telemetry');

const MACHINE_ID = getMachineId();

// const WEBHOOK_URL = 'https://flows.cbnsndwch.net/webhook-test/oss/events/ghl-cli';
const WEBHOOK_URL = 'https://flows.cbnsndwch.net/webhook/oss/events/ghl-cli';

const CLI_VERSION = getCliVersion();

/**
 * Flat payload shape matching the `cli_events` Postgres table.
 */
interface EventPayload {
    event_id: string;
    event_ts: string;
    event_name: string;
    anonymous_id: string;
    command_name: string | null;
    ci: boolean;
    node_version: string;
    os: string;
    arch: string;
    cli_version: string;
    properties: Record<string, unknown>;
    context: Record<string, unknown>;
}

/**
 * Fire-and-forget: send a telemetry event to the webhook endpoint.
 * Never throws, never blocks the CLI. Silently drops if telemetry is disabled.
 */
export function trackEvent(
    event: string,
    properties: Record<string, unknown> = {}
): void {
    if (!isTelemetryEnabled()) {
        debug.debug('Telemetry disabled, skipping event: %s', event);
        return;
    }

    const payload: EventPayload = {
        event_id: randomUUID(),
        event_ts: new Date().toISOString(),
        event_name: event,
        anonymous_id: MACHINE_ID,
        command_name: (properties.command as string) ?? null,
        ci: IS_CI,
        node_version: process.version,
        os: process.platform,
        arch: process.arch,
        cli_version: CLI_VERSION,
        properties,
        context: {
            ci: IS_CI,
            node_version: process.version,
            os: process.platform,
            arch: process.arch,
            cli_version: CLI_VERSION
        }
    };

    // Non-blocking — intentionally no await
    debug.debug('Sending event: %s %o', event, properties);
    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3_000)
    })
        .then(res => {
            if (!res.ok) {
                debug.warn(
                    'Failed to send telemetry event: %s %o',
                    event,
                    res.statusText
                );
            } else {
                res.json().then(data => {
                    debug.debug(
                        'Received response for telemetry event: %s %o',
                        event,
                        data
                    );
                });
            }
        })
        .catch(err => {
            /* silently fail — never disrupt the CLI */
            debug.warn(
                'Failed to send telemetry event: %s %o',
                event,
                err instanceof Error ? err.message : String(err)
            );
        });
}
