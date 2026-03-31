import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import * as p from '@clack/prompts';
import { defineCommand } from 'citty';
import { downloadTemplate } from 'giget';
import pc from 'picocolors';

import { trackEvent } from '../telemetry/index.js';
import { getAvailableTemplates } from '../templates/index.js';

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

        // ─── Gather templates from registry ───
        const fetchSpinner = p.spinner();
        fetchSpinner.start('Fetching available templates...');
        const templates = await getAvailableTemplates();
        fetchSpinner.stop('Loaded templates registry');

        // ─── Gather options (interactive or from flags) ───

        let appName = args.name as string | undefined;
        let templateId = args.template as string | undefined;

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
                            options: templates.map(t => ({
                                value: t.value,
                                label: t.label,
                                hint: t.hint
                            })),
                            initialValue: templateId ?? templates[0].value
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
            templateId = answers.template as string;
        }

        appName = appName ?? 'my-ghl-app';
        templateId = templateId ?? templates[0].value;

        // Find selected template
        const selectedTemplate =
            templates.find(t => t.value === templateId) || templates[0];

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
        s.start(`Downloading ${pc.cyan(selectedTemplate.label)}...`);

        try {
            await downloadTemplate(selectedTemplate.repo, {
                dir: targetDir,
                force: true
            });

            // Update package.json name if it exists
            const pkgPath = join(targetDir, 'package.json');
            if (existsSync(pkgPath)) {
                const pkgRaw = await readFile(pkgPath, 'utf-8');
                const pkg = JSON.parse(pkgRaw);
                pkg.name = appName;
                await writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
            }

            s.stop('Template downloaded Successfully!');
        } catch (err: any) {
            s.stop('Failed to download template.');
            p.cancel(`Error: ${err.message}`);
            process.exit(1);
        }

        trackEvent('init:completed', {
            template: selectedTemplate.value
        });

        // ─── Print summary ───

        p.outro(
            [
                `${pc.green('✔')} Scaffolded ${pc.bold(appName)}`,
                '',
                `  ${pc.bold('Next steps:')}`,
                `  ${pc.dim('$')} cd ${appName}`,
                `  ${pc.dim('$')} npm install`,
                `  ${pc.dim('$')} cp .env.example .env`,
                `  ${pc.dim('$')} ghl dev`
            ].join('\n')
        );
    }
});
