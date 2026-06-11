# DealXin — Interview Q&A

## Architecture Decisions

### Q: Why a monorepo instead of separate repos?
A: We use pnpm workspaces monorepo because:
- Shared tooling (TypeScript configs, ESLint, Prettier) across API and web
- Atomic cross-package refactoring (change an interface, both apps update)
- Simplified CI/CD (one pipeline, one version)
- Shared @dealxin/shared package for common types and utilities
- Easy cross-app imports when needed

### Q: Why NestJS over Express/Fastify?
A: NestJS provides:
- Dependency injection out of the box (great for testability)
- Decorator-based routing that pairs well with OpenAPI/Swagger
- Built-in modules system that enforces architectural boundaries
- First-class support for WebSockets, GraphQL, microservices
- Excellent TypeScript integration

### Q: Why the Outbox Pattern instead of direct RabbitMQ publishing?
A: Direct publishing has the dual-write problem — if the DB transaction commits but RabbitMQ publish fails, you have an inconsistent state. The Outbox Pattern solves this by:
1. Writing the event to an OutboxEvent table in the same DB transaction as the business data
2. A separate background worker polls the outbox and publishes to RabbitMQ
3. Only after successful publish does it mark the event as published
This guarantees at-least-once delivery with exactly-once processing on the consumer side.

### Q: Why Meilisearch over Elasticsearch/Algolia?
A: Meilisearch is:
- Zero-config (no schema setup, auto-indexing)
- Typo-tolerant and relevance-ranked out of the box
- Significantly lighter (single binary) — easy to run in development and production
- Vietnamese language support out of the box
- REST API with instant results (<50ms)
- Great for our scale (deal aggregation, not enterprise search)

### Q: Why Adapter Pattern for ingestion?
A: Each platform (Shopee, Lazada, TikTok Shop) has completely different API formats, pagination styles, and data shapes. The Adapter Pattern:
- Isolates platform-specific logic in dedicated adapters
- Provides a unified NormalizedDealInput interface
- Makes adding new platforms a matter of implementing SourceAdapter
- Factory pattern resolves the correct adapter at runtime
- Easy to unit test each adapter in isolation

## Technical Deep Dives

### Q: How does the auth flow work?
A: JWT with refresh token pattern:
1. User logs in → server issues access token (15min) + refresh token (7 days)
2. Access token in Authorization header for API calls
3. When access token expires, client uses refresh token to get new pair
4. Refresh tokens stored in HTTP-only cookies for XSS protection
5. Revocation handled by blacklist (Redis) or shorter-lived refresh tokens

### Q: How does the crawler job system work?
A: Idempotent ingestion pipeline:
1. Admin triggers crawl via API (or scheduled cron)
2. Creates CrawlerJob record with status=PENDING
3. Adapter fetches raw data from platform
4. Normalizes to NormalizedDealInput (unified format)
5. Checks externalId for idempotency — skips if exists
6. Upserts Deal record (create or update)
7. Updates CrawlerJob status + metadata on completion
8. Emits DealSubmitted event to outbox

### Q: How does the search consumer work?
A: Event-driven indexing:
1. Outbox publishes DEAL_APPROVED/REJECTED/EXPIRED events
2. Search consumer receives event from analytics queue (separate from notification queue)
3. On APPROVED: fetches full deal from DB, indexes to Meilisearch
4. On REJECTED/EXPIRED: removes deal from Meilisearch index
5. Search API queries Meilisearch with filters (platform, category, discount)
6. Results returned with relevance scoring and faceting

### Q: How does the analytics tracking work?
A: Fire-and-forget event pipeline:
1. User actions (view, vote, bookmark) trigger analytics events
2. Events published to analytics RabbitMQ queue (async, non-blocking)
3. Analytics consumer processes events and writes to AnalyticsEvent table
4. Admin analytics dashboard aggregates events for reporting
5. Dashboard shows: total views/upvotes/bookmarks, top deals by views, submissions per day

### Q: What database indexes are used?
A: Key indexes on the Deal model:
- `(status, createdAt)` — listing approved deals by date
- `(platform)` — filter by platform
- `(categoryId)` — filter by category
- `(slug) UNIQUE` — for SEO-friendly URLs
- `(externalId)` — idempotency checks for ingestion
- `(score)` — hot deals ranking
- Plus GIN index on `searchVector` if full-text search needed

## Challenges & Solutions

### Q: What was the hardest technical challenge?
A: Handling `exactOptionalPropertyTypes: true` with Prisma-generated types. Prisma uses `T | null` for nullable fields, but TypeScript strict mode requires `T | undefined` for optional. Solution: explicit interface definitions for DTOs with `property?: string | undefined` syntax, avoiding direct use of Prisma types in API contracts.

### Q: How did you handle Vietnamese content?
A: Used Vietnamese-friendly tooling throughout:
- Plus Jakarta Sans + Be Vietnam Pro fonts
- Vietnamese date/number formatting (vi-VN locale)
- Meilisearch with Vietnamese analyzer
- Tailwind `text-balance` for headings
- Content in Vietnamese for authentic portfolio feel

### Q: How do you handle rate limiting?
A: API rate limiting implemented at the NestJS level with a custom throttle guard:
- 100 requests/minute for authenticated users
- 20 requests/minute for anonymous users
- Custom throttle decorator for sensitive endpoints
- Redis-backed throttle storage for distributed deployments
