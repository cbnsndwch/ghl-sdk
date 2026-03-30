import { defineCommand } from 'citty';
import pc from 'picocolors';
import * as p from '@clack/prompts';

import { tryLoadConfig } from '../config.js';
import {
    createGhlClient,
    formatTime,
    statusSymbol,
    colorStatus,
    colorDuration,
    prettyJson
} from '../utils/index.js';

interface WebhookLogEntry {
    id: string;
    eventType: string;
    statusCode: number;
    responseTimeMs: number;
    locationId: string;
    payload?: Record<string, unknown>;
    createdAt: string;
}

interface WebhookLogsResponse {
    logs?: WebhookLogEntry[];
    webhooks?: WebhookLogEntry[];
}

export const logsCommand = defineCommand({
    meta: {
        name: 'logs',
        description: 'Stream webhook logs in real-time from GHL'
    },
    args: {
        app: {
            type: 'string',
            alias: 'a',
            description: 'GHL Marketplace App ID'
        },
        event: {
            type: 'string',
            alias: 'e',
            description: 'Filter by event type'
        },
        status: {
            type: 'string',
            alias: 's',
            description: 'Filter by status code (e.g. 200, 500, 429)'
        },
        'show-payload': {
            type: 'boolean',
            description: 'Show full payload for error responses',
            default: false
        },
        token: {
            type: 'string',
            alias: 't',
            description:
                'GHL API access token (or set GHL_ACCESS_TOKEN env var)'
        },
        interval: {
            type: 'string',
            alias: 'i',
            description: 'Polling interval in seconds',
            default: '3'
        }
    },
    async run({ args }) {
        p.intro(pc.bgCyan(pc.black(' ghl logs ')));

        const config = await tryLoadConfig();
        const appId = (args.app as string | undefined) || config?.appId;
        const token =
            (args.token as string | undefined) ||
            process.env['GHL_ACCESS_TOKEN'];
        const eventFilter = args.event as string | undefined;
        const statusFilter = args.status ? Number(args.status) : undefined;
        const showPayload = args['show-payload'] as boolean;
        const pollInterval = Number(args.interval ?? '3') * 1000;

        if (!appId) {
            p.cancel(
                `App ID is required.\n\n` +
                    `Provide it via:\n` +
                    `  --app <appId>\n` +
                    `  ghl.config.json "appId" field`
            );
            process.exit(1);
        }

        if (!token) {
            p.cancel(
                `An access token is required.\n\n` +
                    `Provide it via:\n` +
                    `  --token <token>\n` +
                    `  GHL_ACCESS_TOKEN environment variable`
            );
            process.exit(1);
        }

        const baseURL =
            config?.apiBaseUrl ?? 'https://services.leadconnectorhq.com';
        const client = createGhlClient(baseURL, token);

        p.log.info(`Streaming webhook logs for ${pc.bold(appId)}...`);
        if (eventFilter)
            p.log.info(`  Filtering by event: ${pc.cyan(eventFilter)}`);
        if (statusFilter)
            p.log.info(`  Filtering by status: ${colorStatus(statusFilter)}`);
        p.log.info(`  ${pc.dim('(Ctrl+C to stop)')}\n`);

        // Track seen webhook IDs for deduplication
        const seen = new Set<string>();
        let consecutiveErrors = 0;
        const MAX_ERRORS = 5;

        const poll = async () => {
            try {
                const data = await client.get<WebhookLogsResponse>(
                    `/webhooks/logs`,
                    {
                        query: {
                            appId,
                            ...(eventFilter ? { eventType: eventFilter } : {}),
                            ...(statusFilter
                                ? { statusCode: statusFilter }
                                : {}),
                            limit: 50
                        }
                    }
                );

                consecutiveErrors = 0;
                const entries = data?.logs ?? data?.webhooks ?? [];

                for (const entry of entries) {
                    if (seen.has(entry.id)) continue;
                    seen.add(entry.id);

                    // Format log line
                    const time = formatTime(entry.createdAt);
                    const symbol = statusSymbol(entry.statusCode);
                    const eventType = entry.eventType.padEnd(25);
                    const status = colorStatus(entry.statusCode);
                    const duration = colorDuration(entry.responseTimeMs);
                    const loc = pc.dim(entry.locationId);

                    console.log(
                        `  ${pc.dim(time)} ${symbol} ${eventType} → ${status} (${duration})  ${loc}`
                    );

                    // Extra info for error/rate-limit responses
                    if (entry.statusCode === 429) {
                        console.log(
                            `             ${pc.yellow('↳ Retry scheduled: attempt 1/6 in ~10min')}`
                        );
                    } else if (entry.statusCode >= 400) {
                        console.log(
                            `             ${pc.red('↳ Retry eligible: NO')} ${pc.dim('(only 429 triggers retry)')}`
                        );
                        if (showPayload && entry.payload) {
                            console.log(
                                `             ${pc.dim('↳ Payload:')} ${pc.dim(prettyJson(entry.payload, 5))}`
                            );
                        }
                    }
                }

                // Prune seen set if it gets large
                if (seen.size > 10_000) {
                    const arr = [...seen];
                    const keep = arr.slice(-5_000);
                    seen.clear();
                    for (const id of keep) seen.add(id);
                }
            } catch (err) {
                consecutiveErrors++;
                const msg = err instanceof Error ? err.message : String(err);

                if (msg.includes('429') || msg.includes('rate limit')) {
                    p.log.warn(
                        `${pc.yellow('⚠')} API rate limit. Backing off for 30s...`
                    );
                    await sleep(30_000);
                    return;
                }

                if (msg.includes('401') || msg.includes('403')) {
                    p.cancel(`Authentication failed: ${msg}`);
                    process.exit(1);
                }

                if (consecutiveErrors >= MAX_ERRORS) {
                    p.cancel(
                        `Too many consecutive errors (${MAX_ERRORS}). Last: ${msg}`
                    );
                    process.exit(1);
                }

                p.log.warn(`${pc.yellow('⚠')} Poll error: ${pc.dim(msg)}`);
            }
        };

        // Graceful shutdown
        const cleanup = () => {
            console.log(`\n${pc.dim('Stopped streaming.')}`);
            process.exit(0);
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

        // Poll loop
        while (true) {
            await poll();
            await sleep(pollInterval);
        }
    }
});

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
