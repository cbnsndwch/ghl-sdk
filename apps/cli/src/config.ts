import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { defu } from 'defu';

/**
 * Shape of the ghl.config.json file at the root of a GHL app project.
 */
export interface GhlConfig {
    /** GHL Marketplace App ID */
    appId: string;
    /** RSA public key for webhook signature verification */
    publicKey?: string;
    /** Scopes requested during OAuth */
    scopes: string[];
    /** Local dev server port */
    port: number;
    /** Webhook receiver path */
    webhookPath: string;
    /** Tunnel provider preference */
    tunnel: 'cloudflare' | 'ngrok';
    /** Base URL for the GHL API */
    apiBaseUrl: string;
}

const DEFAULT_CONFIG: Partial<GhlConfig> = {
    port: 3000,
    webhookPath: '/webhooks',
    tunnel: 'cloudflare',
    apiBaseUrl: 'https://services.leadconnectorhq.com',
    scopes: []
};

const CONFIG_FILE_NAME = 'ghl.config.json';

/**
 * Load ghl.config.json from the given directory (defaults to cwd).
 */
export async function loadConfig(cwd?: string): Promise<GhlConfig> {
    const dir = cwd ?? process.cwd();
    const configPath = resolve(dir, CONFIG_FILE_NAME);

    const raw = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<GhlConfig>;

    return defu(parsed, DEFAULT_CONFIG) as GhlConfig;
}

/**
 * Try to load the config, returning null if the file doesn't exist.
 */
export async function tryLoadConfig(cwd?: string): Promise<GhlConfig | null> {
    try {
        return await loadConfig(cwd);
    } catch {
        return null;
    }
}
