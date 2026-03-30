import { defineConfig } from 'tsup';
import { execSync } from 'child_process';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const getGitHash = () => {
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
        return 'unknown';
    }
};

export default defineConfig({
    bundle: true,
    clean: true,
    dts: true,
    sourcemap: true,
    platform: 'node',
    outDir: 'dist',
    format: ['esm'],
    entry: ['src/index.ts'],
    banner: {
        js: '#!/usr/bin/env node'
    },
    env: {
        CLI_VERSION: `${pkg.version} (${getGitHash()})`
    }
});
