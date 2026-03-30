/**
 * Create a pre-configured HTTP client for the GHL API.
 */
export function createGhlClient(baseURL: string, accessToken?: string) {
    const defaults = {
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
    } as const;

    return {
        get: <T = unknown>(
            url: string,
            opts?: { query?: Record<string, unknown> }
        ) =>
            fetch(url, { ...defaults, method: 'GET' as const, ...opts }).then(
                res => res.json() as Promise<T>
            ),

        post: <T = unknown>(
            url: string,
            body?: Record<string, unknown>,
            opts?: { query?: Record<string, unknown> }
        ) =>
            fetch(url, {
                ...defaults,
                method: 'POST' as const,
                body: JSON.stringify(body),
                ...opts
            }).then(res => res.json() as Promise<T>),

        put: <T = unknown>(
            url: string,
            body?: Record<string, unknown>,
            opts?: { query?: Record<string, unknown> }
        ) =>
            fetch(url, {
                ...defaults,
                method: 'PUT' as const,
                body: JSON.stringify(body),
                ...opts
            }).then(res => res.json() as Promise<T>),

        delete: <T = unknown>(
            url: string,
            opts?: { query?: Record<string, unknown> }
        ) =>
            fetch(url, {
                ...defaults,
                method: 'DELETE' as const,
                ...opts
            }).then(res => res.json() as Promise<T>)
    };
}

/**
 * Send a webhook payload to a target URL.
 * Returns timing and status info.
 */
export async function sendWebhook(
    url: string,
    payload: unknown,
    headers?: Record<string, string>
): Promise<{ status: number; duration: number; body?: unknown }> {
    const start = performance.now();
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
        const duration = Math.round(performance.now() - start);
        const body = await res.json().catch(() => undefined);
        return { status: res.status, duration, body };
    } catch (err: unknown) {
        const duration = Math.round(performance.now() - start);
        const message = err instanceof Error ? err.message : String(err);
        return { status: 0, duration, body: { error: message } };
    }
}
