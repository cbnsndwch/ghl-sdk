import * as crypto from 'node:crypto';

/**
 * Generate an HMAC-SHA256 signature for a webhook payload.
 * This is used for test payloads sent via `ghl webhooks trigger`.
 */
export function generateHmacSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('base64');
}

/**
 * Generate a test webhook ID.
 */
export function generateTestWebhookId(): string {
    return `test_wh_${crypto.randomBytes(8).toString('hex')}`;
}
