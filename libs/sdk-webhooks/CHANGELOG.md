# @cbnsndwch/ghl-sdk-webhooks

## 0.5.2

### Patch Changes

- a5db311: Standardize package build tooling across the SDK workspace.

  This switches package scripts to tsup, oxfmt, and oxlint, moves shared dependency versions into the pnpm catalog, and aligns package build configuration for release and local development.

  Add CLI.

- Updated dependencies [a5db311]
  - @cbnsndwch/ghl-sdk-storage@0.5.2

## 0.5.1

### Patch Changes

- 7a6158e: fix github sponsors badge
- Updated dependencies [7a6158e]
  - @cbnsndwch/ghl-sdk-storage@0.5.1

## 0.5.0

### Minor Changes

- 46b0e0a: Initial release of modular HighLevel SDK packages

  This release introduces a completely modular architecture for the HighLevel SDK, giving you the flexibility to install only what you need:

  **Choose Your Bundle Size:** - API client only: ~800KB (68% smaller than the monolithic SDK) - With memory storage: ~850KB (66% smaller) - With MongoDB storage: ~1.8MB (28% smaller) - Full stack with webhooks: ~2.2MB (12% smaller)

  **Key Benefits:** - **Zero forced dependencies** - No more installing Express or MongoDB when you only need the API client - **Platform agnostic** - Works in Node.js, browsers, Deno, and edge runtimes (Cloudflare Workers, Vercel Edge) - **ESM-first** - Modern module system with full TypeScript support - **Tree-shakeable** - Modern bundlers can optimize unused code - **Fully composable** - Mix and match packages based on your needs

  **Available Packages:** - `@cbnsndwch/ghl-sdk-core` - Core API client with 35+ resources - `@cbnsndwch/ghl-sdk-storage` - Storage interfaces for custom adapters - `@cbnsndwch/ghl-sdk-storage-memory` - In-memory storage for development and testing - `@cbnsndwch/ghl-sdk-storage-mongodb` - Production-ready MongoDB adapter - `@cbnsndwch/ghl-sdk-webhooks` - Framework-agnostic webhook utilities with Express adapter - `@cbnsndwch/ghl-sdk` - Meta-package for backwards compatibility (includes everything)

  **Migration:** Existing users can continue using `@cbnsndwch/ghl-sdk` for a drop-in replacement, or migrate to individual packages for smaller bundles. See the migration guide in `/docs/sdk/` for detailed instructions.

  This modular approach follows modern best practices and gives you full control over your dependency graph and bundle size.

### Patch Changes

- Updated dependencies [46b0e0a]
  - @cbnsndwch/ghl-sdk-storage@0.5.0

## 0.4.0

### Minor Changes

- 973548a: Initial release of modular HighLevel SDK packages

  This release introduces a completely modular architecture for the HighLevel SDK, giving you the flexibility to install only what you need:

  **Choose Your Bundle Size:** - API client only: ~800KB (68% smaller than the monolithic SDK) - With memory storage: ~850KB (66% smaller) - With MongoDB storage: ~1.8MB (28% smaller) - Full stack with webhooks: ~2.2MB (12% smaller)

  **Key Benefits:** - **Zero forced dependencies** - No more installing Express or MongoDB when you only need the API client - **Platform agnostic** - Works in Node.js, browsers, Deno, and edge runtimes (Cloudflare Workers, Vercel Edge) - **ESM-first** - Modern module system with full TypeScript support - **Tree-shakeable** - Modern bundlers can optimize unused code - **Fully composable** - Mix and match packages based on your needs

  **Available Packages:** - `@cbnsndwch/ghl-sdk-core` - Core API client with 35+ resources - `@cbnsndwch/ghl-sdk-storage` - Storage interfaces for custom adapters - `@cbnsndwch/ghl-sdk-storage-memory` - In-memory storage for development and testing - `@cbnsndwch/ghl-sdk-storage-mongodb` - Production-ready MongoDB adapter - `@cbnsndwch/ghl-sdk-webhooks` - Framework-agnostic webhook utilities with Express adapter - `@cbnsndwch/ghl-sdk` - Meta-package for backwards compatibility (includes everything)

  **Migration:** Existing users can continue using `@cbnsndwch/ghl-sdk` for a drop-in replacement, or migrate to individual packages for smaller bundles. See the migration guide in `/docs/sdk/` for detailed instructions.

  This modular approach follows modern best practices and gives you full control over your dependency graph and bundle size.

### Patch Changes

- Updated dependencies [973548a]
  - @cbnsndwch/ghl-sdk-storage@0.4.0
