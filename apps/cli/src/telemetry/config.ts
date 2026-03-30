import { randomUUID } from 'node:crypto';

import Conf from 'conf';

const store = new Conf<{
    anonymousId: string;
    telemetryEnabled: boolean;
    noticeShown: boolean;
}>({
    projectName: 'ghl-cli',
    defaults: {
        anonymousId: '',
        telemetryEnabled: true,
        noticeShown: false
    }
});

/**
 * Return a stable anonymous machine ID, creating one on first call.
 */
export function getMachineId(): string {
    let id = store.get('anonymousId');
    if (!id) {
        id = randomUUID();
        store.set('anonymousId', id);
    }
    return id;
}

/**
 * Whether the user has opted in to telemetry.
 */
export function isTelemetryEnabled(): boolean {
    // Standard env-var opt-out: https://consoledonottrack.com
    if (process.env.DO_NOT_TRACK === '1') return false;
    if (process.env.GHL_TELEMETRY_DISABLED === '1') return false;

    return store.get('telemetryEnabled');
}

export function setTelemetryEnabled(enabled: boolean): void {
    store.set('telemetryEnabled', enabled);
}

/**
 * Whether the first-run telemetry notice has been shown.
 */
export function hasNoticeBeenShown(): boolean {
    return store.get('noticeShown');
}

export function markNoticeShown(): void {
    store.set('noticeShown', true);
}
