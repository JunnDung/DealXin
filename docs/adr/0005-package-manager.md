# ADR-0005: Package Manager — pnpm

**Status**: Accepted
**Date**: 2026-06-11
**Deciders**: DealXin project lead

---

## Decision

Use **pnpm** as the package manager for the DealXin monorepo.

---

## Reasoning

### Why pnpm?

1. **Speed**: pnpm uses a content-addressable store — packages are symlinked from a central store, not copied into each project. Install times are 2-3x faster than npm.
2. **Disk efficiency**: Single instance of each package version on disk, regardless of how many projects depend on it.
3. **Monorepo support**: pnpm has built-in workspace support (`pnpm-workspace.yaml`), no need for npm/yarn workspaces configuration.
4. **Strict dependency isolation**: pnpm prevents packages from accessing packages they don't explicitly depend on — reduces phantom dependency bugs.
5. **Already installed**: Verified `pnpm` is available in the development environment.
6. **Industry standard for monorepos**: Used by major projects (Vite, Next.js, Turborepo itself uses pnpm workspaces).

### Why Not npm?

1. **Speed**: npm is the slowest of the three.
2. **Workspace support**: Requires additional configuration for monorepo.
3. **Hoisting**: npm hoists all dependencies to root, causing phantom dependency bugs.

### Why Not Yarn?

1. **Speed**: Yarn (classic or Berry) is slower than pnpm for monorepos.
2. **Yarn Berry complexity**: Yarn 2+ (Berry) with PnP has a steep learning curve and compatibility issues with some tools.
3. **Adoption**: pnpm's adoption is growing rapidly in the Node.js ecosystem.

---

## Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

This enables:
- `pnpm install` from root installs all workspace dependencies
- `pnpm --filter api` runs commands in specific apps/packages
- Shared `node_modules` via `.pnpm` store

---

## Consequences

### Positive
- Fast installs across all environments
- Strict dependency management prevents bugs
- Clean monorepo workspace structure
- Compatible with Turborepo if added later

### Negative
- Some older tools have issues with pnpm's symlink approach (rare in 2026)
- CI needs `corepack enable pnpm` or cache node_modules correctly

### Mitigation
- Add `engine-strict = true` in `.npmrc` to catch version mismatches
- Cache `~/.pnpm-store` in GitHub Actions
- Use `pnpm install --frozen-lockfile` in CI for reproducibility
