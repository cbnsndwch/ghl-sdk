# @cbnsndwch/ghl-cli

> GHL Marketplace Developer CLI — scaffolding, local dev, webhook testing, and log streaming

## Quick Start

```bash
# From the monorepo root
pnpm install
pnpm build

# Scaffold a new GHL app
node apps/cli/dist/index.js init my-app

# Or run directly after a global link
cd apps/cli && pnpm link --global
ghl init my-app
```

## Commands

| Command                                | Description                                |
| -------------------------------------- | ------------------------------------------ |
| `ghl init [name]`                      | Scaffold a new GHL Marketplace app         |
| `ghl dev`                              | Start local dev server with HTTPS tunnel   |
| `ghl webhooks trigger <event>`         | Send a test webhook event to your endpoint |
| `ghl webhooks list`                    | List all available GHL webhook event types |
| `ghl webhooks replay --id <webhookId>` | Replay a webhook from GHL logs             |
| `ghl logs --app <appId>`               | Stream webhook logs in real-time           |

---

### `ghl init [name]`

Interactively scaffold a new GHL Marketplace app with OAuth, webhooks, token storage, and CI/CD.

```bash
# Interactive mode (prompts for options)
ghl init my-app

# Non-interactive with defaults
ghl init my-app --yes

# Specify a template
ghl init my-app --template workflow-actions
```

**Options:**

| Flag             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `-t, --template` | Template: `custom-pages`, `workflow-actions`, or `full` |
| `-y, --yes`      | Skip prompts and use defaults                           |

**What gets generated:**

```plain
my-app/
├── src/
│   ├── server/
│   │   ├── index.ts          # Express server with OAuth callback
│   │   ├── webhooks.ts       # Webhook consumer with signature verification
│   │   └── tokens.ts         # Multi-location token storage
│   └── lib/
│       └── ghl-client.ts     # Typed GHL API client
├── .github/workflows/ci.yml  # CI/CD pipeline
├── ghl.config.json            # CLI config
├── .env / .env.example        # Environment variables
├── tsconfig.json
└── package.json
```

---

### `ghl dev`

Start your local dev server and open an HTTPS tunnel so GHL can reach your machine.

```bash
# Uses defaults from ghl.config.json
ghl dev

# Custom port
ghl dev --port 4000

# Use ngrok instead of Cloudflare
ghl dev --tunnel ngrok

# Local only (no tunnel)
ghl dev --no-tunnel
```

**Options:**

| Flag          | Default      | Description                            |
| ------------- | ------------ | -------------------------------------- |
| `-p, --port`  | `3000`       | Local dev server port                  |
| `--tunnel`    | `cloudflare` | Tunnel provider: `cloudflare`, `ngrok` |
| `--no-tunnel` | `false`      | Skip tunnel, local-only                |

**Requirements:**

- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (free, no account) — **or** —
- [ngrok](https://ngrok.com/download) (free tier available)

The command auto-detects your framework (Next.js, NestJS, Express, etc.) and runs the appropriate dev script.

---

### `ghl webhooks trigger <event>`

Send a realistic test webhook event to any URL. Ships with 35 built-in sample payloads.

```bash
# Send a ContactCreate event to your local server
ghl webhooks trigger ContactCreate

# Custom target URL
ghl webhooks trigger AppointmentCreate --url http://localhost:4000/hooks

# Include an HMAC signature for testing signature verification
ghl webhooks trigger INSTALL --secret my-webhook-secret
```

**Options:**

| Flag           | Default                          | Description                      |
| -------------- | -------------------------------- | -------------------------------- |
| `-u, --url`    | `http://localhost:3000/webhooks` | Target URL                       |
| `-s, --secret` | —                                | Secret for HMAC-SHA256 signature |

---

### `ghl webhooks list`

List all available webhook event types, grouped by category.

```bash
# Show all events
ghl webhooks list

# Filter by category
ghl webhooks list --category Contacts
```

**Categories:** Contacts, Appointments, Opportunities, Conversations, Forms, Invoices, Orders, App Lifecycle, Courses, Memberships, Payments, Workflows

---

### `ghl webhooks replay --id <webhookId>`

Fetch a real webhook payload from GHL's logs API and re-send it to your endpoint. Useful for debugging failures since GHL only retries on 429 responses.

```bash
ghl webhooks replay --id wh_abc123

# Custom target
ghl webhooks replay --id wh_abc123 --url http://localhost:4000/hooks

# Provide access token inline
ghl webhooks replay --id wh_abc123 --token <your-token>
```

**Options:**

| Flag          | Default                          | Description          |
| ------------- | -------------------------------- | -------------------- |
| `--id`        | _(required)_                     | Webhook ID to replay |
| `-u, --url`   | `http://localhost:3000/webhooks` | Target URL           |
| `-t, --token` | `$GHL_ACCESS_TOKEN`              | GHL API access token |

---

### `ghl logs --app <appId>`

Stream webhook delivery logs in real-time, with color-coded status and retry info.

```bash
# Stream all logs
ghl logs --app my-app-id --token <token>

# Filter by event type
ghl logs --app my-app-id --event ContactCreate

# Filter by status code and show payloads for errors
ghl logs --app my-app-id --status 500 --show-payload

# Faster polling
ghl logs --app my-app-id --interval 1
```

**Options:**

| Flag             | Default                | Description                           |
| ---------------- | ---------------------- | ------------------------------------- |
| `-a, --app`      | from `ghl.config.json` | GHL Marketplace App ID                |
| `-e, --event`    | —                      | Filter by event type                  |
| `-s, --status`   | —                      | Filter by HTTP status code            |
| `--show-payload` | `false`                | Show payload body for error responses |
| `-t, --token`    | `$GHL_ACCESS_TOKEN`    | GHL API access token                  |
| `-i, --interval` | `3`                    | Polling interval in seconds           |

**Output:**

```plain
14:23:01 ✔ ContactCreate         → 200 (23ms)   loc_abc123
14:23:05 ✔ ContactUpdate         → 200 (45ms)   loc_abc123
14:23:12 ✖ AppointmentCreate     → 500 (1203ms) loc_xyz789
             ↳ Retry eligible: NO (only 429 triggers retry)
14:23:15 ⚠ ContactUpdate         → 429 (12ms)   loc_abc123
             ↳ Retry scheduled: attempt 1/6 in ~10min
```

---

## Configuration

Commands read from `ghl.config.json` in the project root:

```json
{
    "appId": "your-app-id",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "scopes": [],
    "port": 3000,
    "webhookPath": "/webhooks",
    "tunnel": "cloudflare",
    "apiBaseUrl": "https://services.leadconnectorhq.com"
}
```

Environment variables (`GHL_ACCESS_TOKEN`) can also be used for authentication.

---

## Development

```bash
# From monorepo root
pnpm install
pnpm build

# Run the CLI locally
node apps/cli/dist/index.js --help

# Watch mode during development
cd apps/cli
pnpm dev
```

## Dependencies

- [`@cbnsndwch/ghl-sdk`](https://www.npmjs.com/package/@cbnsndwch/ghl-sdk) — Unified HighLevel SDK
- [`citty`](https://github.com/unjs/citty) — CLI framework
- [`@clack/prompts`](https://github.com/bombshell-dev/clack) — Interactive terminal prompts
- [`consola`](https://github.com/unjs/consola) — Console logger
- [`ofetch`](https://github.com/unjs/ofetch) — HTTP client
- [`picocolors`](https://github.com/alexeyraspopov/picocolors) — Terminal colors
