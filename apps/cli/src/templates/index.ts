/**
 * Project templates for `ghl init`.
 * Each template returns a map of relative file paths → file contents.
 */

export type TemplateId = 'custom-pages' | 'workflow-actions' | 'full';

export interface TemplateChoice {
    value: TemplateId;
    label: string;
    hint: string;
}

export const TEMPLATE_CHOICES: TemplateChoice[] = [
    {
        value: 'custom-pages',
        label: 'Custom Pages (embedded UI)',
        hint: 'Next.js/Express app with SSO and custom pages'
    },
    {
        value: 'workflow-actions',
        label: 'Workflow Actions/Triggers',
        hint: 'Express API with webhook consumer and workflow integration'
    },
    {
        value: 'full',
        label: 'Full-featured (all modules)',
        hint: 'Complete app with UI, webhooks, workflows, and API'
    }
];

interface TemplateOptions {
    name: string;
    template: TemplateId;
    includeWebhooks: boolean;
    includeCiCd: boolean;
    packageManager: 'npm' | 'yarn' | 'pnpm';
}

// ─── File generators ───

function packageJson(opts: TemplateOptions): string {
    const deps: Record<string, string> = {
        '@cbnsndwch/ghl-sdk': 'latest',
        dotenv: '^17.0.0',
        express: '^5.2.0'
    };

    if (opts.template === 'custom-pages' || opts.template === 'full') {
        deps['next'] = '^15.0.0';
        deps['react'] = '^19.0.0';
        deps['react-dom'] = '^19.0.0';
    }

    const scripts: Record<string, string> = {
        dev: 'ghl dev',
        build: 'tsc -b',
        start: 'node dist/server/index.js'
    };

    if (opts.template === 'custom-pages' || opts.template === 'full') {
        scripts['dev:next'] = 'next dev';
        scripts['build:next'] = 'next build';
    }

    return JSON.stringify(
        {
            name: opts.name,
            version: '0.1.0',
            private: true,
            type: 'module',
            scripts,
            dependencies: deps,
            devDependencies: {
                '@types/node': '^22',
                '@types/express': '^5',
                typescript: '^5.9.0'
            },
            engines: { node: '>=22' }
        },
        null,
        2
    );
}

function ghlConfigJson(_opts: TemplateOptions): string {
    return JSON.stringify(
        {
            $schema:
                'https://raw.githubusercontent.com/cbnsndwch/ghl-app-template/main/schemas/ghl-config.schema.json',
            appId: '',
            clientId: '',
            clientSecret: '',
            scopes: [],
            port: 3000,
            webhookPath: '/webhooks',
            tunnel: 'cloudflare'
        },
        null,
        2
    );
}

function tsconfig(): string {
    return JSON.stringify(
        {
            compilerOptions: {
                target: 'ES2023',
                module: 'NodeNext',
                moduleResolution: 'NodeNext',
                outDir: 'dist',
                rootDir: 'src',
                strict: true,
                esModuleInterop: true,
                declaration: true,
                skipLibCheck: true
            },
            include: ['src'],
            exclude: ['node_modules', 'dist']
        },
        null,
        2
    );
}

function envFile(): string {
    return `# GHL Marketplace App Credentials
# Get these from https://marketplace.gohighlevel.com
GHL_APP_ID=
GHL_CLIENT_ID=
GHL_CLIENT_SECRET=

# Optional: RSA public key for webhook signature verification
# GHL_PUBLIC_KEY=

# Server
PORT=3000
NODE_ENV=development
`;
}

function envExampleFile(): string {
    return `# GHL Marketplace App Credentials
GHL_APP_ID=your_app_id
GHL_CLIENT_ID=your_client_id
GHL_CLIENT_SECRET=your_client_secret
PORT=3000
NODE_ENV=development
`;
}

function gitignore(): string {
    return `node_modules/
dist/
.env
.env.local
.next/
*.log
`;
}

function serverIndex(opts: TemplateOptions): string {
    const webhookImport = opts.includeWebhooks
        ? `\nimport { webhookRouter } from './webhooks.js';`
        : '';
    const webhookUse = opts.includeWebhooks
        ? `\n\n// Webhook consumer\napp.use('/webhooks', webhookRouter);`
        : '';

    return `import 'dotenv/config';
import express from 'express';${webhookImport}

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OAuth callback
app.get('/oauth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        res.status(400).json({ error: 'Missing authorization code' });
        return;
    }

    // TODO: Exchange code for tokens using GHL SDK
    // const hl = new HighLevel({ clientId: process.env.GHL_CLIENT_ID, clientSecret: process.env.GHL_CLIENT_SECRET });
    // const tokens = await hl.oauth.getAccessToken({ code, grant_type: 'authorization_code' });

    res.json({ message: 'OAuth callback received', code });
});${webhookUse}

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(\`🚀 GHL app server running on http://localhost:\${port}\`);
});
`;
}

function webhooksFile(): string {
    return `import { Router } from 'express';
import crypto from 'node:crypto';

export const webhookRouter = Router();

/**
 * Verify webhook signature if public key is configured.
 */
function verifySignature(payload: string, signature: string | undefined): boolean {
    const publicKey = process.env.GHL_PUBLIC_KEY;
    if (!publicKey || !signature) return true; // Skip if not configured

    try {
        const verifier = crypto.createVerify('sha256');
        verifier.update(payload);
        verifier.end();
        return verifier.verify(publicKey, signature, 'base64');
    } catch {
        return false;
    }
}

webhookRouter.post('/', (req, res) => {
    const signature = req.headers['x-wh-signature'] as string | undefined;
    const payload = JSON.stringify(req.body);

    if (!verifySignature(payload, signature)) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
    }

    const event = req.body;
    console.log(\`[Webhook] \${event.type}\`, JSON.stringify(event, null, 2));

    // Handle different event types
    switch (event.type) {
        case 'INSTALL':
            console.log(\`App installed at \${event.locationId || event.companyId}\`);
            // TODO: Exchange authorization, store tokens
            break;
        case 'UNINSTALL':
            console.log(\`App uninstalled from \${event.locationId || event.companyId}\`);
            // TODO: Clean up stored tokens
            break;
        default:
            console.log(\`Unhandled webhook event: \${event.type}\`);
    }

    res.status(200).json({ success: true });
});
`;
}

function tokensFile(): string {
    return `import { MemorySessionStorage } from '@cbnsndwch/ghl-sdk';

/**
 * Token storage abstraction.
 *
 * For production, replace MemorySessionStorage with MongoDBSessionStorage
 * or implement your own ISessionStorage.
 */
export const tokenStorage = new MemorySessionStorage();

/**
 * Initialize token storage on startup.
 */
export async function initStorage(): Promise<void> {
    await tokenStorage.init();
}
`;
}

function readmeFile(opts: TemplateOptions): string {
    return `# ${opts.name}

A GHL Marketplace app built with the [GHL App Template](https://github.com/cbnsndwch/ghl-app-template).

## Getting Started

1. Install dependencies:
   \`\`\`bash
   ${opts.packageManager} install
   \`\`\`

2. Copy \`.env.example\` to \`.env\` and fill in your GHL credentials:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start the dev server with a tunnel:
   \`\`\`bash
   ghl dev
   \`\`\`

4. Configure your app in the [GHL Developer Portal](https://marketplace.gohighlevel.com):
   - Set the OAuth redirect URL to \`<tunnel-url>/oauth/callback\`
   - Set the webhook URL to \`<tunnel-url>/webhooks\`

## Project Structure

\`\`\`
${opts.name}/
├── src/
│   ├── server/
│   │   ├── index.ts          # Express server entry point
│   │   ├── webhooks.ts       # Webhook consumer with signature verification
│   │   └── tokens.ts         # Multi-location token storage
│   └── lib/
│       └── ghl-client.ts     # Typed GHL API client
├── ghl.config.json            # CLI configuration
├── .env                       # Environment variables (not committed)
├── .env.example               # Environment template
└── package.json
\`\`\`

## Commands

- \`ghl dev\` — Start local dev server with HTTPS tunnel
- \`ghl webhooks trigger <event>\` — Send test webhook events
- \`ghl webhooks list\` — List available webhook events
- \`ghl logs --app <appId>\` — Stream webhook logs
`;
}

function ghlClientFile(): string {
    return `import { HighLevel } from '@cbnsndwch/ghl-sdk';

/**
 * Create a configured GHL API client.
 */
export function createClient() {
    return new HighLevel({
        clientId: process.env.GHL_CLIENT_ID,
        clientSecret: process.env.GHL_CLIENT_SECRET,
    });
}
`;
}

function ciCdWorkflow(opts: TemplateOptions): string {
    const installCmd =
        opts.packageManager === 'npm'
            ? 'npm ci'
            : `${opts.packageManager} install`;
    const runCmd =
        opts.packageManager === 'npm' ? 'npm run' : opts.packageManager;

    return `name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: ${opts.packageManager}

      - run: ${installCmd}
      - run: ${runCmd} build
      - run: ${runCmd} test

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: ${opts.packageManager}
      - run: ${installCmd}
      - run: ${runCmd} build
      # TODO: Add your deployment steps here
      - run: echo "Deploy step placeholder for ${opts.name}"
`;
}

// ─── Template assembler ───

export function generateTemplate(opts: TemplateOptions): Map<string, string> {
    const files = new Map<string, string>();

    // Core files
    files.set('package.json', packageJson(opts));
    files.set('ghl.config.json', ghlConfigJson(opts));
    files.set('tsconfig.json', tsconfig());
    files.set('.env', envFile());
    files.set('.env.example', envExampleFile());
    files.set('.gitignore', gitignore());
    files.set('README.md', readmeFile(opts));

    // Server files
    files.set('src/server/index.ts', serverIndex(opts));
    files.set('src/lib/ghl-client.ts', ghlClientFile());
    files.set('src/server/tokens.ts', tokensFile());

    // Webhooks (if selected)
    if (opts.includeWebhooks) {
        files.set('src/server/webhooks.ts', webhooksFile());
    }

    // CI/CD (if selected)
    if (opts.includeCiCd) {
        files.set('.github/workflows/ci.yml', ciCdWorkflow(opts));
    }

    return files;
}
