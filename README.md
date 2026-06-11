# DealXin — Real-time Deal Aggregator Platform

> M\u1ED9t n\u1EC1n t\u1EA3ng full-stack \u0111\u1EC3 t\u1ED5ng h\u1EE3p deal, voucher, flash sale v\u00E0 \u01B0u \u0111\u00E3i th\u01B0\u01A1ng m\u1EA1i \u0111i\u1EC7n t\u1EED Vi\u1EC7t Nam.

## Project Status

**Phase 0 \u2014 Planning \u2713 Complete**
**Phase 1 \u2014 Monorepo Scaffold \u2713 In Progress**

\u0110ang x\u00E2y d\u1EF1ng theo t\u1EEBng phase. Xem [docs/roadmap.md](docs/roadmap.md) \u0111\u1EC3 bi\u1EBFt ti\u1EBFn \u0111\u1ED9.

## Quick Start

```bash
# Clone repo
git clone https://github.com/yourusername/dealxin.git
cd dealxin

# Install dependencies (requires pnpm)
pnpm install

# Start infrastructure
docker compose up -d

# Copy env file
cp .env.example .env
# Edit .env and fill in secrets

# Start development
pnpm dev
```

Frontend: http://localhost:3000
API: http://localhost:3001
Swagger: http://localhost:3001/api

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript strict |
| Styling | Tailwind CSS, shadcn/ui |
| State | TanStack Query, Zustand |
| Backend | NestJS 11, TypeScript strict |
| ORM | Prisma 7, PostgreSQL 17 |
| Cache | Redis 7 |
| Message Broker | RabbitMQ 3 |
| Search | Meilisearch |
| Container | Docker Compose |
| CI/CD | GitHub Actions |
| Deploy | Vercel (frontend), Render/Railway (backend) |

## Architecture

Modular monolith \u2192 microservices-ready. Xem [docs/adr/0001-architecture-style.md](docs/adr/0001-architecture-style.md).

```
apps/
\u251C\u2500\u2500 web/          Next.js frontend
\u2514\u2500\u2500 api/          NestJS backend (modular monolith)

packages/
\u251C\u2500\u2500 shared/       Shared types, utils, error classes
\u251C\u2500\u2500 contracts/    Event contracts, DTOs
\u2514\u2500\u2500 config/       Shared ESLint, TypeScript configs
```

## Phases

| Phase | M\u00F4 t\u1EA3 | Tr\u1EA1ng th\u00E1i |
|---|---|---|
| 0 | Audit & Planning | \u2713 Done |
| 1 | Monorepo Scaffold | In Progress |
| 2 | Database & Auth | Pending |
| 3 | Deals Core | Pending |
| 4 | Frontend MVP | Pending |
| 5 | Ingestion & Adapters | Pending |
| 6 | Event-Driven & Microservices | Pending |
| 7 | Search | Pending |
| 8 | Notifications & Realtime | Pending |
| 9 | Analytics & Admin Polish | Pending |
| 10 | Observability & CI/CD | Pending |
| 11 | Deployment | Pending |
| 12 | Recruiter Polish | Pending |

## Docs

- [Roadmap](docs/roadmap.md)
- [Architecture ADR](docs/adr/0001-architecture-style.md)
- [Database ADR](docs/adr/0002-database-choice.md)
- [Event Broker ADR](docs/adr/0003-event-broker-choice.md)
- [Search Engine ADR](docs/adr/0004-search-engine-choice.md)
- [Package Manager ADR](docs/adr/0005-package-manager.md)

## Environment Variables

Xem [.env.example](.env.example).

## License

MIT
