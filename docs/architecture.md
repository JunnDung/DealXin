# DealXin — Architecture Overview

> Last updated: 2026-06-12

---

## System Overview

DealXin is a real-time deal aggregation platform for Vietnamese ecommerce users. It aggregates deals from Shopee, Lazada, TikTok Shop, and manual submissions into a unified, searchable catalog with admin moderation, user voting/bookmarking, and real-time notifications.

**Production-quality portfolio project** demonstrating full-stack engineering, event-driven architecture, microservices-ready structure, and modern DevOps practices.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                                   │
│   Next.js 15 │ TanStack Query │ Zustand │ shadcn/ui │ Tailwind CSS         │
└────────────────────────────┬─────────────────────────────────────────────────┘
                             │ HTTPS / REST / SSE
                             ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        NestJS API (Port 3001)                               │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌─────────┐ │
│  │AuthModule│  │DealsModule│  │Ingestion  │  │Notification │  │Analytics│ │
│  │          │  │          │  │ Module    │  │  Module     │  │ Module  │ │
│  │JWT/RBAC  │  │Repository│  │ Adapter   │  │ SSE/Polling│  │Consumer │ │
│  │          │  │Strategy  │  │Factory    │  │             │  │         │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘  └────┬────┘ │
│       │              │              │                │              │           │
│  ┌────┴─────────────┴─────────────┴──────────────────────────┴─────────┐ │
│  │                    Prisma ORM Data Layer                             │ │
│  │              PostgreSQL (PrismaClient)                             │ │
│  └───────────────────────────┬───────────────────────────────────────────┘ │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌─────────────┐     ┌───────────┐     ┌──────────────┐
    │ PostgreSQL  │     │ RabbitMQ   │     │  Meilisearch │
    │  Database   │     │  Broker   │     │   Search     │
    └─────────────┘     └─────┬─────┘     └──────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
          ┌────────────┐ ┌──────────┐ ┌────────────┐
          │  Search    │ │Notification│ │ Analytics  │
          │ Consumer   │ │ Consumer  │ │ Consumer   │
          └────────────┘ └──────────┘ └────────────┘
```

---

## Module Architecture (NestJS)

### Backend Modules

| Module | Responsibility | Key Classes |
|---|---|---|
| `AuthModule` | JWT auth, register, login, refresh, RBAC | `AuthController`, `AuthService`, `JwtStrategy`, `RolesGuard` |
| `DealsModule` | Deal CRUD, vote, bookmark, status workflow | `DealsController`, `DealsService`, `PrismaDealRepository`, `DealStatusTransitionStrategy` |
| `IngestionModule` | Multi-platform data import | `IngestionController`, `IngestionService`, `SourceAdapterFactory`, `MockShopeeAdapter`, etc. |
| `SearchModule` | Full-text search via Meilisearch | `SearchController`, `SearchService`, `MeilisearchService` |
| `NotificationModule` | In-app notifications, SSE stream | `NotificationController`, `NotificationSseController`, `NotificationService` |
| `AnalyticsModule` | Event tracking, admin dashboard data | `AnalyticsController`, `AnalyticsService`, `AnalyticsConsumer` |
| `CategoriesModule` | Deal categories | `CategoriesController`, `CategoriesService` |
| `HealthModule` | Health checks | `HealthController` |
| `MessagingModule` | RabbitMQ pub/sub, all consumers | `MessagingService`, `SearchConsumer`, `NotificationConsumer`, `AnalyticsConsumer` |
| `CommonModule` | Outbox pattern, audit log, logging | `OutboxService`, `OutboxPublisherService`, `AuditLogService` |

### Frontend Route Structure

```
src/app/
├── (site)/
│   ├── layout.tsx          # Main layout (header, footer, providers)
│   ├── page.tsx           # Home / landing page
│   ├── deals/
│   │   ├── page.tsx      # Deal listing (grid, filters, sort, pagination)
│   │   └── [slug]/
│   │       └── page.tsx   # Deal detail (price, coupon, countdown, vote)
│   ├── search/
│   │   └── page.tsx       # Full-text search (filters, results)
│   ├── dashboard/
│   │   └── page.tsx       # User dashboard (my deals, bookmarks)
│   ├── notifications/
│   │   └── page.tsx       # Notification list
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── admin/
│       ├── page.tsx       # Admin moderation queue
│       ├── analytics/
│       │   └── page.tsx   # Analytics dashboard
│       └── status/
│           └── page.tsx    # System health status
```

---

## Data Flow

### Deal Submission & Moderation Flow

```
User submits deal
       │
       ▼
IngestionModule.normalize() → DealDTO
       │
       ▼
DealsService.createDeal() → INSERT Deal (status=PENDING)
       │
       ├─► AuditLogService.log()
       │
       ├─► OutboxService.emit("DealSubmitted")
       │
       └─► MessagingService.publish(analytics.queue, event)
                       │
                       ▼
              AnalyticsConsumer → AnalyticsEvent table
                       │
                       ▼
              User views /admin → Pending deals listed
                       │
                       ▼
              Admin clicks "Approve"
                       │
                       ▼
              DealsService.approveDeal() → DB Transaction:
                ├─ UPDATE Deal (status=APPROVED)
                ├─ INSERT AuditLog
                ├─ INSERT OutboxEvent (eventType="search.index")
                └─ INSERT Notification (for deal creator)
                       │
                       ▼
              OutboxPublisher (polls every 2s)
                │
                ▼
              Publish to "search.index" queue
                │
                ▼
              SearchConsumer.handleSearchIndex()
                │
                ▼
              MeilisearchService.indexDeal()
                │
                ▼
              Deal searchable in <2s after approval
```

### Search Flow

```
User types query
       │
       ▼
GET /api/search/deals?q=iphone&platform=SHOPEE
       │
       ▼
SearchService.searchDeals()
       │
       ▼
MeilisearchService.search(query, filters)
       │
       ▼
Returns { data: hits[], meta: { total, page, ... } }
       │
       ▼
Frontend renders results with TanStack Query cache
```

---

## Request Lifecycle

```
HTTP Request
    │
    ▼
NestJS Middleware
  ├─ CORS
  ├─ Logging (Pino + requestId)
  ├─ Correlation ID
  └─ Helmet
    │
    ▼
JwtAuthGuard (global, skip if @Public())
    │
    ▼
Controller
    │
    ▼
DTO Validation (class-validator)
    │
    ▼
Service (business logic)
    │
    ▼
Repository (Prisma)
    │
    ▼
Response (mapped DTO)
    │
    ▼
AppErrorFilter (exception → structured JSON)
    │
    ▼
HTTP Response
```

---

## Database Schema (Prisma Models)

```
User ─────┬──► RefreshToken
           ├──► Deal (as creator) ─────► DealCategory
           ├──► Deal (as approver) ────► DealSource
           ├──► DealVote
           ├──► DealBookmark
           ├──► Notification
           └──► AnalyticsEvent

Deal ───────► PriceHistory
Deal ───────► OutboxEvent (async events)
Deal ───────► AuditLog (admin actions)
Deal ───────► SearchIndexJob
```

See [docs/database-erd.md](database-erd.md) for full ERD.

---

## Infrastructure

### Docker Compose Services

| Service | Image | Purpose | Port |
|---|---|---|---|
| `postgres` | postgres:17-alpine | Primary database | 5432 |
| `redis` | redis:7-alpine | Cache / pub-sub | 6379 |
| `rabbitmq` | rabbitmq:3-management | Message broker | 5672, 15672 |
| `meilisearch` | getmeili/meilisearch | Full-text search | 7700 |
| `api` | (build) | NestJS backend | 3001 |
| `web` | (build) | Next.js frontend | 3000 |

---

## Security Model

```
┌────────────────────────────────────────┐
│          JWT Access Token (15min)        │
│   Header: Authorization: Bearer <token> │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│          JWT Refresh Token (7d)         │
│   HTTP-only cookie (XSS protection)     │
└────────────────────────────────────────┘

Role-based access:
  USER  → own deals, bookmarks, votes, notifications
  ADMIN → all user permissions + moderation, analytics, ingestion
```

---

## Scalability Considerations

| Concern | Current Solution | Future Scale Path |
|---|---|---|
| Database reads | Prisma with indexes | Read replicas, PgBouncer |
| Search | Meilisearch (single node) | Meilisearch cluster |
| Messaging | RabbitMQ single node | RabbitMQ cluster |
| Caching | Redis (future) | Redis Cluster |
| Deployment | Railway / Fly.io | Kubernetes |
| CDN | Vercel Edge | CloudFront |
| Auth | JWT self-contained | Keycloak / Auth0 |

---

## Environment Variables

See [.env.example](../.env.example) for the full list.

Key groups:
- **Database**: `DATABASE_URL`
- **Auth**: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`
- **Infrastructure**: `REDIS_URL`, `RABBITMQ_URL`
- **Search**: `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`
- **CORS**: `CORS_ORIGIN`

---

## Further Reading

- [ADR-0001: Architecture Style](adr/0001-architecture-style.md) — Modular monolith vs microservices decision
- [ADR-0002: Database Choice](adr/0002-database-choice.md) — PostgreSQL + Prisma rationale
- [ADR-0003: Event Broker Choice](adr/0003-event-broker-choice.md) — RabbitMQ rationale
- [ADR-0004: Search Engine Choice](adr/0004-search-engine-choice.md) — Meilisearch rationale
- [ADR-0005: Package Manager](adr/0005-package-manager.md) — pnpm rationale
- [Event Contracts](event-contracts.md) — All domain event shapes
- [Design Patterns](design-patterns.md) — Patterns implemented in the codebase
- [API Documentation](api-docs.md) — Endpoint reference
- [Database ERD](database-erd.md) — Schema visualization
