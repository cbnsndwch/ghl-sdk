export interface TemplateChoice {
    value: string;
    label: string;
    hint: string;
    repo: string;
}

const DEFAULT_TEMPLATES: TemplateChoice[] = [
    // {
    //     value: 'custom-pages',
    //     label: 'Custom Pages (embedded UI)',
    //     hint: 'Next.js/Express app with SSO and custom pages',
    //     repo: 'github:cbnsndwch/ghl-template-custom-pages'
    // },
    // {
    //     value: 'workflow-actions',
    //     label: 'Workflow Actions/Triggers',
    //     hint: 'Express API with webhook consumer and workflow integration',
    //     repo: 'github:cbnsndwch/ghl-template-workflow-actions'
    // },
    {
        value: 'full',
        label: 'Full Stack React Router',
        hint: 'NestJS + React Router 7 SSR. Complete monorepo app with UI, webhooks, workflows, and API',
        repo: 'github:cbnsndwch/ghl-app-template'
    }
];

/**
 * Fetch the latest templates from the central registry.
 * Falls back to the defaults if offline or the registry is unreachable.
 */
export async function getAvailableTemplates(): Promise<TemplateChoice[]> {
    try {
        const res = await fetch('https://raw.githubusercontent.com/cbnsndwch/ghl-app-template/main/templates-registry.json');
        if (res.ok) {
            const registry = await res.json();
            if (Array.isArray(registry) && registry.length > 0) {
                return registry;
            }
        }
    } catch {
        // Fallback silently
    }
    
    return DEFAULT_TEMPLATES;
}