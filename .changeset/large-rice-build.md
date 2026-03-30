---
'@cbnsndwch/ghl-app-contracts': patch
'@cbnsndwch/ghl-sdk': patch
'@cbnsndwch/ghl-sdk-core': patch
'@cbnsndwch/ghl-sdk-storage': patch
'@cbnsndwch/ghl-sdk-storage-memory': patch
'@cbnsndwch/ghl-sdk-storage-mongodb': patch
'@cbnsndwch/ghl-sdk-webhooks': patch
---

Standardize package build tooling across the SDK workspace.

This switches package scripts to tsup, oxfmt, and oxlint, moves shared dependency versions into the pnpm catalog, and aligns package build configuration for release and local development.