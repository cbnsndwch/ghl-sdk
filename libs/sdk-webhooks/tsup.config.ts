import { defineConfig } from 'tsup';

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
    }
});
