// oxlint-disable no-console
import pc from 'picocolors';

import {
    isTelemetryEnabled,
    hasNoticeBeenShown,
    markNoticeShown
} from './config.js';

/**
 * Print a one-time notice on first run to let users know about telemetry.
 */
export function showTelemetryNotice(): void {
    if (hasNoticeBeenShown() || !isTelemetryEnabled()) return;

    markNoticeShown();

    console.log();
    console.log(
        `  ${pc.dim('ℹ')} Anonymous usage stats help improve ${pc.bold('ghl-cli')}.`
    );
    console.log(`    Disable anytime: ${pc.cyan('ghl telemetry disable')}`);
    console.log(`    Or set ${pc.cyan('DO_NOT_TRACK=1')} in your environment.`);
    console.log();
}
