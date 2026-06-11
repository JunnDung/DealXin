# DealXin — Roadmap

> Last updated: 2026-06-12
> Status: All Phases Complete

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
- [x] ADR documents
- [x] Repo structure proposal
- [x] AgentMemory save

### Phase 1 — Monorepo Scaffold
- [x] Initialize pnpm monorepo
- [x] Create `apps/web` (Next.js + TypeScript + Tailwind + shadcn/ui)
- [x] Create `apps/api` (NestJS + TypeScript)
- [x] Create `packages/shared`, `packages/contracts`, `packages/config`
- [x] TypeScript strict config
- [x] ESLint + Prettier
- [x] `.env.example`
- [x] Docker Compose (postgres, redis, rabbitmq, meilisearch)
- [x] README v0.1
- [x] CI pipeline (lint, typecheck, test, build)

### Phase 2 — Database and Auth
- [x] Prisma schema design
- [x] Migration
- [x] Seed data (admin, users, categories, sources, sample deals)
- [x] Auth: register, login, refresh token, logout, /me
- [x] RBAC: USER, ADMIN
- [x] Unit + integration tests for auth
- [x] `docs/database-erd.md` update
- [x] `docs/api-docs.md` update

### Phase 3 — Deals Core
- [x] Deal CRUD
- [x] User submit deal
- [x] Admin approve/reject/expire
- [x] Deal status transition validation
- [x] Vote deal
- [x] Bookmark deal
- [x] Price history tracking
- [x] Deal scoring strategy
- [x] Repository, Strategy, State machine patterns
- [x] AuditLog
- [x] Swagger/OpenAPI docs
- [x] Unit + integration tests

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
- [x] Loading / error / empty states
- [x] Responsive mobile layout

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
- [x] RabbitMQ integration (MessagingModule with amqp-connection-manager)
- [x] OutboxEvent model (already in schema)
- [x] OutboxService + OutboxPublisherService (polling worker)
- [x] DealApproved/Rejected/Expired/Submitted events emitted from DealsService
- [x] Outbox worker (publisher) — at-least-once delivery guarantee
- [x] Search consumer (search.index queue, logs events — Meilisearch in Phase 7)
- [x] Notification consumer (notification.send queue — creates in-app notifications)
- [x] CQRS light (write via OutboxService, async processing via consumers)
- [x] `docs/event-contracts.md`

### Phase 7 — Search
- [x] Meilisearch setup
- [x] Index approved deals
- [x] Search endpoint (full-text, filters, sort)
- [x] Frontend search page
- [x] Reindex script
- [x] Search suggestions

### Phase 8 — Notification and Realtime
- [x] In-app notification model
- [x] Notification list
- [x] Mark as read
- [x] SSE or WebSocket
- [x] Notification on deal approved
- [x] Price drop alert (mock)
- [x] E2E test

### Phase 9 — Analytics and Admin Polish
- [x] DealViewed tracking
- [x] DealClicked tracking
- [x] Hot deal ranking
- [x] Admin analytics charts
- [x] Audit logs UI
- [x] Source performance metrics

### Phase 10 — Observability and CI/CD
- [x] Structured logging (Pino)
- [x] Request ID / Correlation ID
- [x] Health checks
- [x] OpenTelemetry setup (if feasible)
- [x] GitHub Actions: lint → typecheck → test → build
- [x] Docker healthcheck
- [x] `docs/testing.md` and `docs/deployment.md`

### Phase 11 — Deployment
- [x] Deploy frontend to Vercel
- [x] Backend deploy guide (Render/Fly.io/Railway/VPS)
- [x] Env vars configuration
- [x] Fix build errors
- [x] Update README with demo link
- [x] Deployment docs

### All Phases Complete
- [x] Hallmark UI audit + polish
- [x] Screenshots for README
- [x] `docs/cv-bullets.md`
- [x] `docs/interview-qa.md`
- [x] Architecture diagram
- [x] Final README polish

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
