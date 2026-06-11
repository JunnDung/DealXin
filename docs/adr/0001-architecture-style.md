# ADR-0001: Architecture Style — Modular Monolith → Microservices

**Status**: Accepted
**Date**: 2026-06-11
**Deciders**: DealXin project lead
**Context**: Building a production-style fullstack platform with limited scope, targeting intern portfolio demonstration.

---

## Decision

We adopt a **modular monolith** as the initial architecture, evolving toward **microservices** once business flows are proven stable.

---

## Reasoning

### Why Not Microservices From Day One?

1. **Over-engineering risk**: Splitting into 8 services (api-gateway, auth, deal, ingestion, search, notification, analytics, web) before having a working product is a common mistake. It creates distributed systems complexity (network failures, data consistency, service discovery) before the problem domain is well understood.

2. **Team size**: This is a portfolio project built by 1 person. Managing 8 services, 8 Docker containers, 8 deployment pipelines is not practical for an intern-level project.

3. **Harder to demonstrate**: Recruiters want to see clean, working code. A monolith with clear module boundaries is more impressive than 8 broken microservices.

### Why Modular Monolith?

1. **Single deployable unit**: One Docker container for the backend, easy to run locally and deploy.
2. **Clear module boundaries**: NestJS modules (`AuthModule`, `DealsModule`, `IngestionModule`, etc.) provide the same logical separation as microservices without the operational overhead.
3. **Easy to refactor**: When a module needs to become a service, it already has clean interfaces and a repository layer. The extraction is mechanical.
4. **Fast iteration**: No inter-service communication overhead during development.

---

## Module Map

Initial modules inside `apps/api`:

```
apps/api/src/
├── auth/          # AuthModule — JWT, refresh token, RBAC
├── users/         # UsersModule — profile, roles
├── deals/         # DealsModule — CRUD, moderation, voting
├── bookmarks/     # BookmarksModule — user saved deals
├── prices/        # PriceHistoryModule — price tracking
├── ingestion/     # IngestionModule — adapters, import
├── search/        # SearchModule — Meilisearch sync
├── notifications/ # NotificationsModule — in-app, SSE
├── analytics/     # AnalyticsModule — views, clicks
├── outbox/        # OutboxModule — event publishing
├── crawlers/      # CrawlersModule — job management
└── audit/         # AuditModule — admin action logs
```

Each module follows NestJS module conventions with its own:
- Controller
- Service
- Repository (Prisma)
- DTOs
- Entities
- Guards / Decorators

---

## Migration Path to Microservices

Phase 6 introduces RabbitMQ and the Outbox pattern. After Phase 6, each module is **already event-aware**. The extraction path is:

```
Phase 6:   Module A emits events via Outbox → RabbitMQ
Phase 7+:  Module A becomes a separate service
           → Consumer lives in a new service
           → Database schema stays the same (module owns its tables)
```

Key rules for migration:
1. Each service owns its database tables.
2. Communication is event-driven via RabbitMQ.
3. No direct cross-service HTTP calls for business operations.
4. API Gateway (`apps/api-gateway/`) is added only when there are 3+ services.

---

## Consequences

### Positive
- Fast to scaffold and iterate
- Single database transaction for multi-table operations
- Easy local development (1 Docker service for backend)
- Clear module boundaries that map to the eventual service diagram
- Easier to demonstrate design patterns (Repository, Strategy, etc.)

### Negative
- Single deployment unit — scaling one module scales everything
- Module boundaries are enforced by convention, not by network
- Database becomes a scaling bottleneck (solvable with read replicas later)

### Mitigation
- NestJS modules enforce dependency direction
- Each module only imports shared contracts, never other module code directly
- Repository pattern means Prisma is hidden behind interfaces — easy to swap

---

## References

- [Modular Monolith — Simon Brown](https://www.youtube.com/watch?v=5O5AAngFCfM)
- NestJS module system documentation
- Martin Fowler on Monolith First
