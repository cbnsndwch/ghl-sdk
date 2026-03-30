import { defineCommand } from 'citty';
import pc from 'picocolors';
import * as p from '@clack/prompts';

import { WEBHOOK_EVENTS, getCategories } from '../../fixtures/index.js';

export const listCommand = defineCommand({
    meta: {
        name: 'list',
        description: 'List all available GHL webhook event types'
    },
    args: {
        category: {
            type: 'string',
            alias: 'c',
            description: 'Filter by category'
        }
    },
    async run({ args }) {
        p.intro(pc.bgCyan(pc.black(' ghl webhooks list ')));

        const categories = getCategories();
        const filterCat = args.category as string | undefined;

        const events = filterCat
            ? WEBHOOK_EVENTS.filter(
                  e => e.category.toLowerCase() === filterCat.toLowerCase()
              )
            : WEBHOOK_EVENTS;

        if (events.length === 0) {
            p.log.warn(
                `No events found for category "${filterCat}". Available categories: ${categories.join(', ')}`
            );
            return;
        }

        // Group by category
        const grouped = new Map<string, typeof events>();
        for (const e of events) {
            const list = grouped.get(e.category) ?? [];
            list.push(e);
            grouped.set(e.category, list);
        }

        const lines: string[] = [];
        for (const [category, catEvents] of grouped) {
            lines.push(`\n  ${pc.bold(pc.cyan(category))}`);
            lines.push(`  ${'─'.repeat(60)}`);
            for (const e of catEvents) {
                lines.push(
                    `  ${pc.green(e.type.padEnd(35))} ${pc.dim(e.description)}`
                );
            }
        }

        p.note(lines.join('\n'), `${events.length} Webhook Event Types`);

        p.outro(
            `${pc.dim('Trigger a test event:')} ghl webhooks trigger <EventType>`
        );
    }
});
