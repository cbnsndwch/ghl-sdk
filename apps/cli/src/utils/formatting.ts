import pc from 'picocolors';

/**
 * Format a status code with color.
 */
export function colorStatus(status: number): string {
    if (status >= 200 && status < 300) return pc.green(String(status));
    if (status === 429) return pc.yellow(String(status));
    if (status >= 400) return pc.red(String(status));
    return pc.gray(String(status));
}

/**
 * Format a response time with color based on duration.
 */
export function colorDuration(ms: number): string {
    const text = `${ms}ms`;
    if (ms < 200) return pc.green(text);
    if (ms < 1000) return pc.yellow(text);
    return pc.red(text);
}

/**
 * Format a timestamp as HH:MM:SS.
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour12: false });
}

/**
 * Status symbol for terminal output.
 */
export function statusSymbol(status: number): string {
    if (status >= 200 && status < 300) return pc.green('✔');
    if (status === 429) return pc.yellow('⚠');
    return pc.red('✖');
}

/**
 * Box display for key/value pairs.
 */
export function kvLine(key: string, value: string): string {
    return `  ${pc.bold(key.padEnd(14))} ${value}`;
}

/**
 * Compact JSON display (indented, truncated if large).
 */
export function prettyJson(obj: unknown, maxLines = 20): string {
    const json = JSON.stringify(obj, null, 2);
    const lines = json.split('\n');
    if (lines.length <= maxLines) return json;
    return lines.slice(0, maxLines).join('\n') + '\n  ...';
}
