import { defineCommand } from 'citty';
import pc from 'picocolors';
import * as p from '@clack/prompts';

import { getEventMap } from '../../fixtures/index.js';
import {
    sendWebhook,
    generateTestWebhookId,
    generateHmacSignature,
    colorStatus,
    colorDuration,
    prettyJson
} from '../../utils/index.js';

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
        },
        secret: {
            type: 'string',
            alias: 's',
            description: 'Secret for HMAC signature generation (optional)'
        }
    },
    async run({ args }) {
        p.intro(pc.bgCyan(pc.black(' ghl webhooks trigger ')));

        const eventType = args.event as string;
        const url = args.url as string;
        const secret = args.secret as string | undefined;

        // Look up sample payload
        const eventMap = getEventMap();
        const eventDef = eventMap.get(eventType);

        if (!eventDef) {
            const available = [...eventMap.keys()].join(', ');
            p.cancel(
                `Unknown event type: ${pc.bold(eventType)}\n\nAvailable types: ${pc.dim(available)}\n\nRun ${pc.cyan('ghl webhooks list')} to see all event types.`
            );
            process.exit(1);
        }

        // Build payload with test webhook ID
        const webhookId = generateTestWebhookId();
        const payload = {
            ...eventDef.samplePayload,
            webhookId
        };

        // Generate signature if secret provided
        const headers: Record<string, string> = {};
        if (secret) {
            const sig = generateHmacSignature(JSON.stringify(payload), secret);
            headers['x-wh-signature'] = sig;
        }

        // Send
        const s = p.spinner();
        s.start(`Sending ${pc.bold(eventType)} → ${url}`);

        const result = await sendWebhook(url, payload, headers);

        s.stop(
            `Response: ${colorStatus(result.status)} ${pc.dim(`(${colorDuration(result.duration)})`)}`
        );

        // Display payload
        p.note(prettyJson(payload, 30), 'Payload sent');

        if (result.status >= 200 && result.status < 300) {
            p.outro(pc.green('✔ Webhook delivered successfully'));
        } else {
            p.log.warn(`Response body: ${prettyJson(result.body, 10)}`);
            p.outro(pc.red('✖ Webhook delivery failed'));
        }
    }
});
