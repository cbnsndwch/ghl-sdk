import * as Sentry from '@sentry/node';

import { getMachineId, isTelemetryEnabled } from './config.js';

const SENTRY_DSN =
    'https://4f4c2331dae95e57c7109932feffa8bd@o4511027893960704.ingest.us.sentry.io/4511135809601536';

let initialized = false;

/**
 * Initialize Sentry for crash reporting. Only runs once, only if telemetry is
 * enabled and a DSN is configured.
 */
export function initSentry(): void {
    if (initialized) {
        return;
    }

    initialized = true;
    if (!SENTRY_DSN || !isTelemetryEnabled()) {
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        // Dial down default integrations — we're a CLI, not a server.
        defaultIntegrations: false,
        integrations: [
            Sentry.onUncaughtExceptionIntegration(),
            Sentry.onUnhandledRejectionIntegration()
        ],
        beforeSend(event) {
            // Strip any file paths that could leak PII
            if (event.exception?.values) {
                for (const ex of event.exception.values) {
                    if (ex.stacktrace?.frames) {
                        for (const frame of ex.stacktrace.frames) {
                            if (frame.filename) {
                                // Keep only the filename, not the full path
                                frame.filename = frame.filename.replace(
                                    /^.*[/\\]/,
                                    ''
                                );
                            }
                        }
                    }
                }
            }
            return event;
        }
    });

    Sentry.setUser({ id: getMachineId() });
}

/**
 * Flush pending Sentry events (call before process exit).
 */
export async function flushSentry(timeout = 2_000): Promise<void> {
    if (!SENTRY_DSN || !isTelemetryEnabled()) {
        return;
    }

    await Sentry.flush(timeout);
}

/**
 * Capture an exception in Sentry (fire-and-forget).
 */
export function captureException(err: unknown): void {
    if (!SENTRY_DSN || !isTelemetryEnabled()) {
        return;
    }

    Sentry.captureException(err);
}
