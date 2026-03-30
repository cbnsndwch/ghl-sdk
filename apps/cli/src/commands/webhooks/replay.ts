import { defineCommand } from 'citty';
import pc from 'picocolors';
import * as p from '@clack/prompts';

import { tryLoadConfig } from '../../config.js';
import {
    createGhlClient,
    sendWebhook,
    colorStatus,
    colorDuration,
    prettyJson
} from '../../utils/index.js';
import { trackEvent } from '../../telemetry/index.js';

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
        },
        token: {
            type: 'string',
            alias: 't',
            description:
                'GHL API access token (or set GHL_ACCESS_TOKEN env var)'
        }
    },
    async run({ args }) {
        p.intro(pc.bgCyan(pc.black(' ghl webhooks replay ')));

        const webhookId = args.webhookId as string;
        const url = args.url as string;
        const token =
            (args.token as string | undefined) ||
            process.env['GHL_ACCESS_TOKEN'];

        if (!token) {
            p.cancel(
                `An access token is required to fetch webhook logs.\n\n` +
                    `Provide it via:\n` +
                    `  --token <token>\n` +
                    `  GHL_ACCESS_TOKEN environment variable`
            );
            process.exit(1);
        }

        const config = await tryLoadConfig();
        const baseURL =
            config?.apiBaseUrl ?? 'https://services.leadconnectorhq.com';

        const s = p.spinner();
        s.start(`Fetching payload for ${pc.bold(webhookId)}...`);

        try {
            const client = createGhlClient(baseURL, token);

            // Attempt to fetch from GHL webhook logs API
            // Note: This endpoint may vary based on GHL API version
            const data = await client.get<{
                webhook?: {
                    id: string;
                    type: string;
                    payload: Record<string, unknown>;
                    createdAt: string;
                };
            }>(`/webhooks/logs/${encodeURIComponent(webhookId)}`);

            if (!data?.webhook?.payload) {
                s.stop('Webhook not found');
                p.cancel(
                    `Could not find webhook with ID ${pc.bold(webhookId)}.\n` +
                        `Verify the webhook ID and try again.`
                );
                process.exit(1);
            }

            const { webhook } = data;
            s.stop(
                `Found event: ${pc.bold(webhook.type)} (${pc.dim(webhook.createdAt)})`
            );

            // Replay the webhook
            const replaySpinner = p.spinner();
            replaySpinner.start(`Replaying → ${url}`);

            const result = await sendWebhook(url, webhook.payload);

            replaySpinner.stop(
                `Response: ${colorStatus(result.status)} ${pc.dim(`(${colorDuration(result.duration)})`)}`
            );

            p.note(prettyJson(webhook.payload, 25), 'Replayed payload');

            if (result.status >= 200 && result.status < 300) {
                p.outro(pc.green('✔ Webhook replayed successfully'));
            } else {
                p.outro(pc.red('✖ Webhook replay failed'));
            }

            trackEvent('webhooks:replay', {
                status: result.status,
                duration: result.duration
            });
        } catch (err) {
            s.stop('Failed');
            const message = err instanceof Error ? err.message : String(err);

            if (message.includes('401') || message.includes('403')) {
                p.cancel(
                    `Authentication failed. Check your access token.\n${pc.dim(message)}`
                );
            } else if (message.includes('404')) {
                p.cancel(
                    `Webhook log endpoint not found. The GHL API may not support this yet.\n` +
                        `${pc.dim(message)}\n\n` +
                        `${pc.yellow('Tip:')} Use ${pc.cyan('ghl webhooks trigger <event>')} to send test events instead.`
                );
            } else {
                p.cancel(`Failed to fetch webhook: ${message}`);
            }
            process.exit(1);
        }
    }
});
