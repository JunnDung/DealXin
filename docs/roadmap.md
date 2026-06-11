# DealXin — Roadmap

> Last updated: 2026-06-11
> Status: Phase 5 — Ingestion & Adapters ✓ | Phase 6 — Event-Driven

---

## Overview

**DealXin** is a real-time deal aggregation platform for Vietnamese ecommerce users. The project aims to be a production-quality portfolio piece demonstrating fullstack engineering, microservices architecture, and modern DevOps practices.

**Goal**: Ship a fullstack platform that can be presented in a tech CV, portfolio, and live demo for intern IT positions.

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend | Next.js | 16.x (latest) | App Router, TypeScript strict |
| Styling | Tailwind CSS | latest | v4 if available |
| UI Components | shadcn/ui | 3.x | Radix UI + Tailwind |
| State/Fetch | TanStack Query + Zustand | latest | |
| Forms | React Hook Form + Zod | latest | |
| Backend | NestJS | 11.x | TypeScript strict |
| ORM | Prisma | 7.x | latest stable |
| Database | PostgreSQL | 17.x | via Docker |
| Cache | Redis | latest | Docker |
| Message Broker | RabbitMQ | 3.x | Docker |
| Search | Meilisearch | latest | Docker |
| E2E Testing | Playwright | latest | |
| Container | Docker + Docker Compose | 29.x | |
| CI/CD | GitHub Actions | — | |
| Deploy Frontend | Vercel | — | MCP ready |
| Observability | OpenTelemetry + Pino | — | Structured logging |

---

## Monorepo Structure

```
dealxin/
├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # NestJS backend (modular monolith)
├── packages/
│   ├── shared/               # Shared types, utils
│   ├── contracts/            # Event contracts, DTOs
│   └── config/               # Shared ESLint, TypeScript configs
├── infra/
│   └── docker/               # Docker configs
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   ├── architecture.md
│   ├── database-erd.md
│   ├── api-docs.md
│   └── event-contracts.md
├── scripts/                  # Dev/maintenance scripts
├── docker-compose.yml
├── README.md
└── .env.example
```

> **Note**: Services (auth-service, deal-service, etc.) start as modules inside `apps/api`. They are extracted into standalone services in Phase 6+ only after the business flow is proven.

---

## Phase Breakdown

### Phase 0 — Project Audit and Planning *(current)*
- [x] Workspace check
- [x] Tool/middleware inventory
- [x] Tech stack validation via Context7
- [x] Architecture decision proposals
- [ ] ADR documents
- [ ] Repo structure proposal
- [ ] AgentMemory save

### Phase 1 — Monorepo Scaffold
- [ ] Initialize pnpm monorepo
- [ ] Create `apps/web` (Next.js + TypeScript + Tailwind + shadcn/ui)
- [ ] Create `apps/api` (NestJS + TypeScript)
- [ ] Create `packages/shared`, `packages/contracts`, `packages/config`
- [ ] TypeScript strict config
- [ ] ESLint + Prettier
- [ ] `.env.example`
- [ ] Docker Compose (postgres, redis, rabbitmq, meilisearch)
- [ ] README v0.1
- [ ] CI pipeline (lint, typecheck, test, build)

### Phase 2 — Database and Auth
- [ ] Prisma schema design
- [ ] Migration
- [ ] Seed data (admin, users, categories, sources, sample deals)
- [ ] Auth: register, login, refresh token, logout, /me
- [ ] RBAC: USER, ADMIN
- [ ] Unit + integration tests for auth
- [ ] `docs/database-erd.md` update
- [ ] `docs/api-docs.md` update

### Phase 3 — Deals Core
- [ ] Deal CRUD
- [ ] User submit deal
- [ ] Admin approve/reject/expire
- [ ] Deal status transition validation
- [ ] Vote deal
- [ ] Bookmark deal
- [ ] Price history tracking
- [ ] Deal scoring strategy
- [ ] Repository, Strategy, State machine patterns
- [ ] AuditLog
- [ ] Swagger/OpenAPI docs
- [ ] Unit + integration tests

### Phase 4 — Frontend MVP
- [x] Landing page (taste-skill direction, hallmark audit)
- [x] Deals listing page
- [x] Deal detail page
- [x] Login / Register pages
- [x] User dashboard (saved deals, price tracking, notifications)
- [x] Admin dashboard (overview, moderation, sources, analytics)
- [x] Typed API client
- [x] TanStack Query integration
- [x] Hallmark UI audit (13 issues fixed)
- [x] Playwright smoke tests (8/8 passing)
- [ ] Loading / error / empty states
- [ ] Responsive mobile layout

### Phase 5 — Ingestion and Adapters
- [x] Ingestion module (controller + service)
- [x] MockShopeeAdapter (5 mock deals, 500ms delay)
- [x] MockLazadaAdapter (3 mock deals)
- [x] MockTikTokShopAdapter (3 mock deals)
- [x] JsonImportAdapter (supports deals/items/data arrays)
- [x] CsvImportAdapter (quoted CSV parsing)
- [x] Data normalization to DealDTO
- [x] Idempotency check (by sourceUrl)
- [x] CrawlerJob model + migration
- [x] SourceAdapter interface + AdapterFactory
- [x] API endpoints: import/json, import/csv, crawl/:sourceType, jobs, jobs/:id

### Phase 6 — Event-Driven and Microservices-Ready
- [ ] RabbitMQ integration
- [ ] OutboxEvent model
- [ ] DealApproved/Rejected/Expired events
- [ ] Outbox worker (publisher)
- [ ] Search consumer (index to Meilisearch)
- [ ] Notification consumer
- [ ] Analytics consumer
- [ ] CQRS light (read vs write separation)
- [ ] `docs/event-contracts.md`

### Phase 7 — Search
- [ ] Meilisearch setup
- [ ] Index approved deals
- [ ] Search endpoint (full-text, filters, sort)
- [ ] Frontend search page
- [ ] Reindex script
- [ ] Search suggestions

### Phase 8 — Notification and Realtime
- [ ] In-app notification model
- [ ] Notification list
- [ ] Mark as read
- [ ] SSE or WebSocket
- [ ] Notification on deal approved
- [ ] Price drop alert (mock)
- [ ] E2E test

### Phase 9 — Analytics and Admin Polish
- [ ] DealViewed tracking
- [ ] DealClicked tracking
- [ ] Hot deal ranking
- [ ] Admin analytics charts
- [ ] Audit logs UI
- [ ] Source performance metrics

### Phase 10 — Observability and CI/CD
- [ ] Structured logging (Pino)
- [ ] Request ID / Correlation ID
- [ ] Health checks
- [ ] OpenTelemetry setup (if feasible)
- [ ] GitHub Actions: lint → typecheck → test → build
- [ ] Docker healthcheck
- [ ] `docs/testing.md` and `docs/deployment.md`

### Phase 11 — Deployment
- [ ] Deploy frontend to Vercel
- [ ] Backend deploy guide (Render/Fly.io/Railway/VPS)
- [ ] Env vars configuration
- [ ] Fix build errors
- [ ] Update README with demo link
- [ ] Deployment docs

### Phase 12 — Recruiter Polish
- [ ] Hallmark UI audit + polish
- [ ] Screenshots for README
- [ ] `docs/cv-bullets.md`
- [ ] `docs/interview-qa.md`
- [ ] Architecture diagram
- [ ] Final README polish

---

## Scope Boundaries

### In Scope (Will Build)
- Full auth flow with JWT + refresh token
- Deal CRUD with admin moderation
- Full-text search with Meilisearch
- Event-driven architecture with RabbitMQ
- Docker Compose for local dev
- Type-safe monorepo with shared contracts
- E2E tests with Playwright
- CI pipeline with GitHub Actions
- Responsive frontend with shadcn/ui

### Out of Scope (Will Not Build)
- Real crawler that bypasses anti-bot / ToS
- Actual payment integration
- Mobile native app
- Production-grade monitoring stack
- Full AI features (abstraction only, mock LLM)

---

## Architecture Decisions

| # | Topic | Decision | ADR |
|---|---|---|---|
| 1 | Architecture Style | Modular Monolith → Microservices | ADR-0001 |
| 2 | Database | PostgreSQL + Prisma ORM | ADR-0002 |
| 3 | Event Broker | RabbitMQ | ADR-0003 |
| 4 | Search Engine | Meilisearch | ADR-0004 |
| 5 | Package Manager | pnpm | ADR-0005 |

---

## Success Criteria

Each phase is complete when:
1. Feature works end-to-end (API + DB + Frontend)
2. Tests pass (unit/integration/E2E as applicable)
3. Docs updated
4. Committed with conventional commit message

**Definition of Done** (project-level):
- `pnpm dev` starts everything
- Auth, deals, admin moderation, search, notifications all functional
- Docker Compose runs all services
- README is recruiter-ready with demo screenshots
- CV bullet points and interview Q&A exist
- Frontend deployed to Vercel (or deploy guide written)
