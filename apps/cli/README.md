# @cbnsndwch/ghl-cli

> GHL Marketplace Developer CLI — scaffolding, local dev, webhook testing, and log streaming

## Commands

| Command                                | Description                                |
| -------------------------------------- | ------------------------------------------ |
| `ghl init [name]`                      | Scaffold a new GHL Marketplace app         |
| `ghl dev`                              | Start local dev server with HTTPS tunnel   |
| `ghl webhooks trigger <event>`         | Send a test webhook event to your endpoint |
| `ghl webhooks list`                    | List all available GHL webhook event types |
| `ghl webhooks replay --id <webhookId>` | Replay a webhook from GHL logs             |
| `ghl logs --app <appId>`               | Stream webhook logs in real-time           |

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
