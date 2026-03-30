import { spawn, type ChildProcess } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import consola from 'consola';

export interface DevServerInfo {
    process: ChildProcess;
    port: number;
    framework: string;
    stop: () => void;
}

interface PackageJson {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

/**
 * Detect the framework used in the project directory.
 */
async function detectFramework(
    cwd: string
): Promise<{ name: string; devScript: string }> {
    let pkg: PackageJson = {};
    try {
        const raw = await readFile(resolve(cwd, 'package.json'), 'utf-8');
        pkg = JSON.parse(raw);
    } catch {
        return { name: 'node', devScript: 'node .' };
    }

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts ?? {};

    // Detect framework from dependencies
    if (allDeps['next']) {
        return { name: 'next.js', devScript: scripts['dev'] ?? 'next dev' };
    }
    if (allDeps['nuxt']) {
        return { name: 'nuxt', devScript: scripts['dev'] ?? 'nuxt dev' };
    }
    if (allDeps['@nestjs/core']) {
        return {
            name: 'nestjs',
            devScript:
                scripts['start:dev'] ?? scripts['dev'] ?? 'nest start --watch'
        };
    }
    if (allDeps['express'] || allDeps['fastify'] || allDeps['koa']) {
        const fw = allDeps['express']
            ? 'express'
            : allDeps['fastify']
              ? 'fastify'
              : 'koa';
        return {
            name: fw,
            devScript: scripts['dev'] ?? 'tsx watch src/server/index.ts'
        };
    }

    // Fallback to package.json "dev" script
    if (scripts['dev']) {
        return { name: 'node', devScript: scripts['dev'] };
    }

    return { name: 'node', devScript: 'node .' };
}

/**
 * Start the local dev server using the detected framework.
 */
export async function startDevServer(
    cwd: string,
    port: number
): Promise<DevServerInfo> {
    const { name, devScript } = await detectFramework(cwd);

    consola.info(`Detected framework: ${name}`);
    consola.info(`Running: ${devScript}`);

    // Split the command for spawn
    const [cmd, ...cmdArgs] = devScript.split(' ');

    const child = spawn(cmd!, cmdArgs, {
        cwd,
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
        env: {
            ...process.env,
            PORT: String(port),
            NODE_ENV: 'development'
        }
    });

    child.on('error', err => {
        consola.error(`Dev server error: ${err.message}`);
    });

    return {
        process: child,
        port,
        framework: name,
        stop: () => {
            child.kill('SIGTERM');
        }
    };
}
