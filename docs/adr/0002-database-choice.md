# ADR-0002: Database Choice — PostgreSQL + Prisma ORM

**Status**: Accepted
**Date**: 2026-06-11
**Deciders**: DealXin project lead

---

## Decision

Use **PostgreSQL** as the primary database with **Prisma ORM** as the data access layer.

---

## Reasoning

### Why PostgreSQL?

1. **Relational integrity**: Deals, users, categories, votes, and bookmarks have clear relational structures. A relational DB enforces this naturally.
2. **Full-text search**: PostgreSQL has `tsvector`/`tsquery` for basic search, though we'll layer Meilisearch on top for richer features.
3. **Mature ecosystem**: Widely understood, easy to hire/explain, strong tooling.
4. **PostGIS / JSONB**: PostgreSQL can store semi-structured data (deal metadata) in JSONB columns if needed.
5. **Supabase-ready**: If migrating to Supabase cloud, the same PostgreSQL schema works without changes.

### Why Prisma?

1. **Type-safe queries**: Prisma's generated client eliminates runtime SQL errors in TypeScript code.
2. **Migration system**: `prisma migrate dev` provides a clean workflow for schema evolution with rollback support.
3. **Studio**: Prisma Studio is useful for seed data management and debugging during development.
4. **Familiar API**: Simple enough for NestJS integration, powerful enough for complex queries.
5. **Good Context7 coverage**: Benchmark 87.3 with 16,621 code snippets — well-documented.

### Why Not Supabase Directly?

1. **Control**: Direct Prisma + Docker Postgres gives full control over schema, indexes, and extensions.
2. **Local dev**: Docker Compose Postgres works offline, no cloud dependency during development.
3. **Migration path**: Can migrate to Supabase managed Postgres later without code changes (same Prisma schema).
4. **Portfolio value**: Demonstrates ability to work with raw PostgreSQL schema design, not just managed services.

---

## Consequences

### Positive
- Type-safe database access throughout the codebase
- Clean migration history in Git
- Easy to reason about data integrity
- Supabase migration path is trivial

### Negative
- Prisma adds an abstraction layer (learning curve, occasional performance edge cases)
- Connection pooling needed for serverless environments
- JSON fields are less flexible than full document stores

### Mitigation
- Use `@db.Json` for flexible metadata instead of over-engineering schema
- Configure PgBouncer or Prisma Data Proxy for connection pooling
- Keep queries optimized with proper indexes (Prisma supports raw SQL when needed)
