# GHL SDK Modular Implementation Guide

## Quick Start for Copilot

This guide provides step-by-step instructions for implementing the modular SDK architecture outlined in `SDK_MIGRATION_PLAN.md`.

---

## Prerequisites

Before starting, ensure:

- [x] Reviewed `SDK_MIGRATION_PLAN.md`
- [x] Current SDK code is in `libs/sdk/`
- [x] Workspace uses pnpm and Turbo
- [x] TypeScript 5.9+ is configured

---

## Implementation Phases

### Phase 1: Create Core SDK Package

**Goal**: Extract the API client into a standalone package with no external dependencies.

#### Step 1.1: Create Package Directory

```bash
# Create the new package structure
mkdir -p libs/sdk-core/src/{resources,logging,constants,utils}
```

#### Step 1.2: Copy and Refactor Files

**Copy these files from `libs/sdk/src/` to `libs/sdk-core/src/`:**

| Source | Destination | Changes Required |
|--------|-------------|------------------|
| `logging/` | `logging/` | None |
| `constants/` | `constants/` | None |
| `utils/request-utils.ts` | `utils/request-utils.ts` | Remove storage references |
| `code/*` | `resources/*` | Rename `code` to `resources` |

**Create new files:**

1. **libs/sdk-core/src/types.ts**

```typescript
import { LogLevelType } from './logging';

export interface TokenProvider {
  getToken(type: 'company' | 'location', id: string): Promise<string | null>;
  setToken(type: 'company' | 'location', id: string, token: string, expiresAt?: Date): Promise<void>;
  deleteToken(type: 'company' | 'location', id: string): Promise<void>;
}

export interface HighLevelConfig {
  apiVersion?: string;
  privateIntegrationToken?: string;
  agencyAccessToken?: string;
  locationAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
  tokenProvider?: TokenProvider;
  logLevel?: LogLevelType;
}

export type ValidConfig = 
  | { privateIntegrationToken: string; clientId?: string; clientSecret?: string; agencyAccessToken?: string; locationAccessToken?: string; apiVersion?: string; tokenProvider?: TokenProvider; logLevel?: LogLevelType; }
  | { clientId: string; clientSecret: string; privateIntegrationToken?: undefined; agencyAccessToken?: string; locationAccessToken?: string; apiVersion?: string; tokenProvider?: TokenProvider; logLevel?: LogLevelType; };
```

1. **libs/sdk-core/src/errors.ts**

```typescript
export class GHLError extends Error {
  public statusCode?: number;
  public response?: any;
  public request?: any;

  constructor(message: string, statusCode?: number, response?: any, request?: any) {
    super(message);
    this.name = 'GHLError';
    this.statusCode = statusCode;
    this.response = response;
    this.request = request;
  }
}
```

#### Step 1.3: Refactor HighLevel Class

**Create `libs/sdk-core/src/HighLevel.ts`:**

Copy from `libs/sdk/src/HighLevel.ts` and make these changes:

1. Remove all `storage` imports
2. Remove `WebhookManager` import
3. Replace `SessionStorage` with `TokenProvider` interface
4. Remove `webhook` property
5. Update constructor to accept `TokenProvider` instead of `SessionStorage`
6. Update all storage references to use `tokenProvider`

**Key changes:**

```typescript
// BEFORE
import { SessionStorage } from './storage';
import { WebhookManager } from './webhook';

export interface HighLevelConfig {
  // ...
  sessionStorage?: SessionStorage;
}

export class HighLevel {
  public readonly webhook: WebhookManager;
  
  constructor(config: HighLevelConfig) {
    // ...
    if (config.sessionStorage) {
      this.webhook = new WebhookManager(logger, config.sessionStorage, this.oauth);
    }
  }
}

// AFTER
import { TokenProvider } from './types';

export class HighLevel {
  // Remove webhook property
  
  constructor(config: HighLevelConfig) {
    // Remove webhook initialization
    // Store tokenProvider for use in OAuth flows
  }
}
```

#### Step 1.4: Create Package Configuration Files

**libs/sdk-core/package.json:**

```json
{
  "name": "@cbnsndwch/ghl-sdk-core",
  "version": "0.5.1",
  "description": "Core API client for HighLevel Public APIs",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": "./lib/index.js",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    }
  },
  "main": "./lib/index.cjs",
  "module": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "files": ["lib/**/*"],
  "scripts": {
    "clean": "rimraf lib tsconfig.tsbuildinfo",
    "prebuild": "pnpm clean",
    "build": "tsc -b tsconfig.json",
    "watch": "tsc -b tsconfig.json -w",
    "format": "oxfmt --write src",
    "lint": "oxlint ./src",
    "lint:fix": "oxlint ./src --fix"
  },
  "dependencies": {
    "axios": "^1.13.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

**libs/sdk-core/tsconfig.json:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib"]
}
```

**libs/sdk-core/eslint.config.js:**

```javascript
import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
  },
];
```

**libs/sdk-core/README.md:**

```markdown
# @cbnsndwch/ghl-sdk-core

Core API client for HighLevel Public APIs.

## Installation

```bash
pnpm add @cbnsndwch/ghl-sdk-core
```

## Usage

```typescript
import { HighLevel } from '@cbnsndwch/ghl-sdk-core';

const ghl = new HighLevel({
  privateIntegrationToken: 'your-token',
});

const contacts = await ghl.contacts.searchContactsAdvanced({
  locationId: 'location-id',
  // ... search params
});
```

## Features

- ✅ Zero external dependencies (except axios)
- ✅ ESM and CommonJS support
- ✅ Tree-shakeable
- ✅ Works in Node, Browser, Deno, Edge runtimes
- ✅ Full TypeScript support

## Documentation

See the [main documentation](../../docs/SDK_MIGRATION_PLAN.md) for details.

```

#### Step 1.5: Create Index Exports

**libs/sdk-core/src/index.ts:**

```typescript
// Main client
export { HighLevel } from './HighLevel';

// Types and interfaces
export type {
  HighLevelConfig,
  TokenProvider,
  ValidConfig,
} from './types';

// Error classes
export { GHLError } from './errors';

// Constants
export { UserType, type UserTypeValue } from './constants';

// Logging
export { Logger, LogLevel, type LogLevelType, type LogLevelString } from './logging';

// Default export
export { HighLevel as default } from './HighLevel';
```

#### Step 1.6: Test the Build

```bash
cd libs/sdk-core
pnpm install
pnpm build
```

Verify:

- `lib/` directory created
- `.d.ts` files generated
- No compilation errors

---

### Phase 2: Create Storage Abstraction

**Goal**: Define storage interfaces without implementation dependencies.

#### Step 2.1: Create Package Directory

```bash
mkdir -p libs/sdk-storage/src
```

#### Step 2.2: Create Interface Files

**libs/sdk-storage/src/interfaces.ts:**

```typescript
export interface ISessionData {
  companyId: string;
  locationId?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
  scopes?: string[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITokenProvider {
  getToken(type: 'company' | 'location', id: string): Promise<string | null>;
  setToken(type: 'company' | 'location', id: string, token: string, expiresAt?: Date): Promise<void>;
  deleteToken(type: 'company' | 'location', id: string): Promise<void>;
}

export interface ISessionStorage extends ITokenProvider {
  init(): Promise<void>;
  disconnect(): Promise<void>;
  setClientId(clientId: string): void;
  createSession(data: ISessionData): Promise<void>;
  getSession(companyId: string, locationId?: string): Promise<ISessionData | null>;
  updateSession(companyId: string, locationId: string | undefined, data: Partial<ISessionData>): Promise<void>;
  deleteSession(companyId: string, locationId?: string): Promise<void>;
  hasSession(companyId: string, locationId?: string): Promise<boolean>;
}
```

**libs/sdk-storage/src/base-storage.ts:**

Copy the implementation from the migration plan (Phase 2, section 2.3).

**libs/sdk-storage/src/index.ts:**

```typescript
export type { ISessionData, ITokenProvider, ISessionStorage } from './interfaces';
export { BaseSessionStorage } from './base-storage';
```

#### Step 2.3: Create Package Configuration

**libs/sdk-storage/package.json:**

```json
{
  "name": "@cbnsndwch/ghl-sdk-storage",
  "version": "0.5.1",
  "description": "Storage abstractions for GHL SDK",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": "./lib/index.js",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    }
  },
  "main": "./lib/index.cjs",
  "module": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "files": ["lib/**/*"],
  "scripts": {
    "clean": "rimraf lib tsconfig.tsbuildinfo",
    "prebuild": "pnpm clean",
    "build": "tsc -b tsconfig.json",
    "watch": "tsc -b tsconfig.json -w",
    "format": "oxfmt --write src",
    "lint": "oxlint ./src",
    "lint:fix": "oxlint ./src --fix"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

**libs/sdk-storage/tsconfig.json:**

Same structure as sdk-core, but with different paths.

#### Step 2.4: Build and Test

```bash
cd libs/sdk-storage
pnpm install
pnpm build
```

---

### Phase 3: Create Storage Adapters

#### Step 3.1: Memory Storage Adapter

**Create `libs/sdk-storage-memory/`:**

Follow structure from Phase 3.1-3.3 of the migration plan.

**Key files:**

- `package.json` - Depends on `@cbnsndwch/ghl-sdk-storage`
- `src/memory-storage.ts` - Implementation
- `src/index.ts` - Exports
- `tsconfig.json` - Build config

#### Step 3.2: MongoDB Storage Adapter

**Create `libs/sdk-storage-mongodb/`:**

Follow structure from Phase 3.4-3.6 of the migration plan.

**Key files:**

- `package.json` - Depends on `@cbnsndwch/ghl-sdk-storage` and `mongodb`
- `src/mongodb-storage.ts` - Copy from `libs/sdk/src/storage/mongodb-session-storage.ts` and refactor to extend `BaseSessionStorage`
- `src/index.ts` - Exports
- `tsconfig.json` - Build config

**Refactoring steps:**

1. Import `BaseSessionStorage` from `@cbnsndwch/ghl-sdk-storage`
2. Extend `BaseSessionStorage` instead of `SessionStorage`
3. Remove logger dependency (optional feature)
4. Update method signatures to match interface
5. Simplify initialization logic

---

### Phase 4: Create Webhook Package

#### Step 4.1: Create Package Directory

```bash
mkdir -p libs/sdk-webhooks/src/{adapters}
```

#### Step 4.2: Extract Webhook Logic

**Files to create:**

1. `src/types.ts` - Webhook event types
2. `src/webhook-verifier.ts` - Signature verification
3. `src/webhook-manager.ts` - Core webhook logic
4. `src/adapters/express.ts` - Express middleware
5. `src/index.ts` - Exports

**Source**: Copy from `libs/sdk/src/webhook/webhook-manager.ts` and refactor.

**Key changes:**

1. Remove Express dependency from core
2. Move Express-specific code to adapter
3. Accept `ISessionStorage` instead of `SessionStorage`
4. Accept `HighLevel` instance or create internally

#### Step 4.3: Create Package Configuration

**libs/sdk-webhooks/package.json:**

```json
{
  "name": "@cbnsndwch/ghl-sdk-webhooks",
  "version": "0.5.1",
  "description": "Webhook utilities for GHL SDK",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": "./lib/index.js",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    },
    "./adapters/express": {
      "import": "./lib/adapters/express.js",
      "require": "./lib/adapters/express.cjs",
      "types": "./lib/adapters/express.d.ts"
    }
  },
  "main": "./lib/index.cjs",
  "module": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "files": ["lib/**/*"],
  "scripts": {
    "clean": "rimraf lib tsconfig.tsbuildinfo",
    "prebuild": "pnpm clean",
    "build": "tsc -b tsconfig.json",
    "watch": "tsc -b tsconfig.json -w",
    "format": "oxfmt --write src",
    "lint": "oxlint ./src",
    "lint:fix": "oxlint ./src --fix"
  },
  "dependencies": {
    "@cbnsndwch/ghl-sdk-core": "workspace:*",
    "@cbnsndwch/ghl-sdk-storage": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^5.0.5",
    "@types/node": "^20.0.0",
    "express": "^5.1.0",
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3"
  },
  "peerDependencies": {
    "@cbnsndwch/ghl-sdk-core": "^1.0.0",
    "@cbnsndwch/ghl-sdk-storage": "^1.0.0"
  },
  "peerDependenciesMeta": {
    "express": {
      "optional": true
    }
  },
  "publishConfig": {
    "access": "public"
  }
}
```

---

### Phase 5: Create Meta Package

#### Step 5.1: Create Package Directory

```bash
mkdir -p libs/sdk-unified/src
```

#### Step 5.2: Create Re-export File

**libs/sdk-unified/src/index.ts:**

```typescript
// Re-export everything from core
export * from '@cbnsndwch/ghl-sdk-core';

// Re-export storage interfaces
export * from '@cbnsndwch/ghl-sdk-storage';

// Re-export memory storage
export { MemorySessionStorage } from '@cbnsndwch/ghl-sdk-storage-memory';

// Re-export webhook utilities
export * from '@cbnsndwch/ghl-sdk-webhooks';

// Default export
export { HighLevel as default } from '@cbnsndwch/ghl-sdk-core';
```

#### Step 5.3: Create Package Configuration

**libs/sdk-unified/package.json:**

```json
{
  "name": "@cbnsndwch/ghl-sdk",
  "version": "0.5.1",
  "description": "Unified SDK for HighLevel (meta-package)",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": "./lib/index.js",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    }
  },
  "main": "./lib/index.cjs",
  "module": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "files": ["lib/**/*"],
  "scripts": {
    "clean": "rimraf lib tsconfig.tsbuildinfo",
    "prebuild": "pnpm clean",
    "build": "tsc -b tsconfig.json",
    "watch": "tsc -b tsconfig.json -w",
    "format": "oxfmt --write src",
    "lint": "oxlint ./src",
    "lint:fix": "oxlint ./src --fix"
  },
  "dependencies": {
    "@cbnsndwch/ghl-sdk-core": "workspace:*",
    "@cbnsndwch/ghl-sdk-storage": "workspace:*",
    "@cbnsndwch/ghl-sdk-storage-memory": "workspace:*",
    "@cbnsndwch/ghl-sdk-webhooks": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

---

## Build Order

Due to dependencies, build packages in this order:

```bash
# 1. Storage interfaces (no dependencies)
cd libs/sdk-storage
pnpm install && pnpm build

# 2. Core SDK (no internal dependencies)
cd ../sdk-core
pnpm install && pnpm build

# 3. Storage adapters (depend on sdk-storage)
cd ../sdk-storage-memory
pnpm install && pnpm build

cd ../sdk-storage-mongodb
pnpm install && pnpm build

# 4. Webhooks (depend on core + storage)
cd ../sdk-webhooks
pnpm install && pnpm build

# 5. Meta package (depends on all)
cd ../sdk-unified
pnpm install && pnpm build
```

Or use Turbo from root:

```bash
pnpm build
```

---

## Testing Strategy

### Unit Tests

For each package, create test files:

```typescript
// libs/sdk-core/src/HighLevel.spec.ts
import { describe, it, expect } from 'vitest';
import { HighLevel } from './HighLevel';

describe('HighLevel', () => {
  it('should initialize with private token', () => {
    const client = new HighLevel({
      privateIntegrationToken: 'test-token',
    });
    expect(client).toBeDefined();
  });

  it('should throw on invalid config', () => {
    expect(() => new HighLevel({})).toThrow();
  });
});
```

### Integration Tests

Create a test app in `apps/sdk-test/`:

```typescript
// apps/sdk-test/src/index.ts
import { HighLevel } from '@cbnsndwch/ghl-sdk-core';
import { MemorySessionStorage } from '@cbnsndwch/ghl-sdk-storage-memory';
import { WebhookManager } from '@cbnsndwch/ghl-sdk-webhooks';

// Test API client only
const ghl1 = new HighLevel({
  privateIntegrationToken: process.env.GHL_TOKEN,
});

// Test with storage
const storage = new MemorySessionStorage();
await storage.init();
storage.setClientId(process.env.CLIENT_ID);

const ghl2 = new HighLevel({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  tokenProvider: storage,
});

// Test webhooks
const webhookManager = new WebhookManager({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  publicKey: process.env.WEBHOOK_PUBLIC_KEY,
  storage,
});
```

---

## Migration Checklist

### Pre-Migration

- [ ] Backup current `libs/sdk/` directory
- [ ] Review all breaking changes
- [ ] Set up test environment
- [ ] Create feature branch

### Core Migration

- [ ] Create `sdk-core` package
- [ ] Copy and refactor API resources
- [ ] Remove storage dependencies
- [ ] Remove webhook dependencies
- [ ] Build and test

### Storage Migration

- [ ] Create `sdk-storage` package
- [ ] Define interfaces
- [ ] Create `BaseSessionStorage`
- [ ] Build and test

### Adapter Migration

- [ ] Create `sdk-storage-memory` package
- [ ] Implement memory adapter
- [ ] Build and test
- [ ] Create `sdk-storage-mongodb` package
- [ ] Implement MongoDB adapter
- [ ] Build and test

### Webhook Migration

- [ ] Create `sdk-webhooks` package
- [ ] Extract webhook logic
- [ ] Create Express adapter
- [ ] Build and test

### Meta Package

- [ ] Create `sdk-unified` package
- [ ] Set up re-exports
- [ ] Build and test

### Testing

- [ ] Unit tests for all packages
- [ ] Integration tests
- [ ] E2E tests
- [ ] Bundle size tests

### Documentation

- [ ] Update README files
- [ ] Create migration guide
- [ ] Document breaking changes
- [ ] Add usage examples

### Publishing

- [ ] Update package versions
- [ ] Build all packages
- [ ] Run all tests
- [ ] Publish to npm
- [ ] Tag release

---

## Common Issues and Solutions

### Issue 1: Circular Dependencies

**Problem**: Packages depend on each other circularly.

**Solution**: Use workspace protocol (`workspace:*`) and ensure correct build order.

### Issue 2: TypeScript Path Mapping

**Problem**: TypeScript can't resolve workspace packages.

**Solution**: Add to `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@cbnsndwch/ghl-sdk-core": ["./libs/sdk-core/src"],
      "@cbnsndwch/ghl-sdk-storage": ["./libs/sdk-storage/src"],
      "@cbnsndwch/ghl-sdk-storage-memory": ["./libs/sdk-storage-memory/src"],
      "@cbnsndwch/ghl-sdk-storage-mongodb": ["./libs/sdk-storage-mongodb/src"],
      "@cbnsndwch/ghl-sdk-webhooks": ["./libs/sdk-webhooks/src"]
    }
  }
}
```

### Issue 3: ESM/CJS Compatibility

**Problem**: Module format issues.

**Solution**: Ensure `package.json` exports are correct:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./lib/index.js",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    }
  }
}
```

### Issue 4: Missing Dependencies

**Problem**: Runtime dependencies not installed.

**Solution**: Use `peerDependencies` for optional deps:

```json
{
  "peerDependencies": {
    "mongodb": "^6.0.0"
  },
  "peerDependenciesMeta": {
    "mongodb": {
      "optional": true
    }
  }
}
```

---

## Success Metrics

Track these metrics to validate the migration:

1. **Bundle Size**
   - API-only: < 1MB (target: 800KB)
   - With memory storage: < 1MB (target: 850KB)
   - Full SDK: < 2.5MB (unchanged)

2. **Install Time**
   - API-only: < 10s
   - Full SDK: < 30s

3. **Build Time**
   - Per package: < 30s
   - Full workspace: < 2min

4. **Test Coverage**
   - Core: 80%+
   - Storage: 90%+
   - Webhooks: 80%+

5. **Breaking Changes**
   - Zero for meta-package users
   - Clear migration path for direct users

---

## Next Steps

After completing the migration:

1. **Deprecate Old Package**
   - Update `libs/sdk/README.md` with deprecation notice
   - Point to new packages
   - Set npm deprecation warning

2. **Update Documentation**
   - Main README
   - API docs
   - Examples

3. **Community Engagement**
   - Announce on GitHub
   - Blog post
   - Update marketplace listing

4. **Monitor Issues**
   - Track GitHub issues
   - Monitor npm download stats
   - Collect feedback

---

## Reference Commands

```bash
# Build all packages
pnpm build

# Build specific package
cd libs/sdk-core && pnpm build

# Test all packages
pnpm test

# Lint all packages
pnpm lint

# Clean all packages
pnpm clean

# Bump versions
pnpm vpatch  # 1.0.0 -> 1.0.1
pnpm vminor  # 1.0.0 -> 1.1.0
pnpm vmajor  # 1.0.0 -> 2.0.0

# Publish all packages
pnpm -r pub
```

---

This implementation guide provides concrete steps that Copilot can follow to execute the migration plan. Each phase builds on the previous one, ensuring a systematic and testable approach to modularizing the SDK.
