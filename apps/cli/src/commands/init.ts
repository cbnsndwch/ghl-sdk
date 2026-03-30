import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

import { defineCommand } from 'citty';
import * as p from '@clack/prompts';
import pc from 'picocolors';

import {
    generateTemplate,
    TEMPLATE_CHOICES,
    type TemplateId
} from '../templates/index.js';
import { trackEvent } from '../telemetry/index.js';

export const initCommand = defineCommand({
    meta: {
        name: 'init',
        description: 'Scaffold a new GHL Marketplace app'
    },
    args: {
        name: {
            type: 'positional',
            description: 'Name of the app to create',
            required: false
        },
        template: {
            type: 'string',
            alias: 't',
            description:
                'Template to use (custom-pages, workflow-actions, full)'
        },
        yes: {
            type: 'boolean',
            alias: 'y',
            description: 'Skip prompts and use defaults',
            default: false
        }
    },
    async run({ args }) {
        p.intro(pc.bgCyan(pc.black(' ghl init ')));

        // ─── Gather options (interactive or from flags) ───

        let appName = args.name as string | undefined;
        let templateId = args.template as TemplateId | undefined;
        let includeWebhooks = true;
        let includeCiCd = true;

        if (!args.yes) {
            const answers = await p.group(
                {
                    name: () =>
                        p.text({
                            message: 'What is the name of your app?',
                            placeholder: 'my-ghl-app',
                            defaultValue: appName ?? 'my-ghl-app',
                            validate: v => {
                                if (!v) return 'App name is required';
                                if (/[^a-z0-9\-_]/.test(v))
                                    return 'Use lowercase letters, numbers, hyphens, underscores only';
                            }
                        }),
                    template: () =>
                        p.select({
                            message: 'What type of GHL app are you building?',
                            options: TEMPLATE_CHOICES,
                            initialValue: (templateId ??
                                'custom-pages') as TemplateId
                        }),
                    webhooks: () =>
                        p.confirm({
                            message: 'Include webhook consumer?',
                            initialValue: true
                        }),
                    cicd: () =>
                        p.confirm({
                            message: 'Include CI/CD pipeline config?',
                            initialValue: true
                        })
                },
                {
                    onCancel: () => {
                        p.cancel('Operation cancelled.');
                        process.exit(0);
                    }
                }
            );

            appName = answers.name;
            templateId = answers.template;
            includeWebhooks = answers.webhooks;
            includeCiCd = answers.cicd;
        }

        appName = appName ?? 'my-ghl-app';
        templateId = templateId ?? 'custom-pages';

        // ─── Check target directory ───

        const targetDir = join(process.cwd(), appName);

        if (existsSync(targetDir)) {
            p.cancel(
                `Directory ${pc.bold(appName)} already exists. Choose a different name or remove it first.`
            );
            process.exit(1);
        }

        // ─── Generate files ───

        const s = p.spinner();
        s.start('Scaffolding project...');

        const files = generateTemplate({
            name: appName,
            template: templateId,
            includeWebhooks,
            includeCiCd
        });

        for (const [relPath, content] of files) {
            const absPath = join(targetDir, relPath);
            await mkdir(dirname(absPath), { recursive: true });
            await writeFile(absPath, content, 'utf-8');
        }

        s.stop('Project scaffolded!');

        trackEvent('init:completed', {
            template: templateId,
            includeWebhooks,
            includeCiCd,
            fileCount: files.size
        });

        // ─── Print summary ───

        p.note(
            [
                `${pc.bold(appName)}/`,
                ...Array.from(files.keys()).map(f => `  ${pc.dim('├──')} ${f}`)
            ].join('\n'),
            'Created files'
        );

        p.outro(
            [
                `${pc.green('✔')} Scaffolded ${pc.bold(appName)}`,
                '',
                `  ${pc.bold('Next steps:')}`,
                `  ${pc.dim('$')} cd ${appName}`,
                `  ${pc.dim('$')} npm install`,
                `  ${pc.dim('$')} ghl dev`
            ].join('\n')
        );
    }
});
