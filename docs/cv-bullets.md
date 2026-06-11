# DealXin — Technical CV Bullets

## Full-Stack Development
- Built a production-grade real-time deal aggregator platform (DealXin) from scratch using Next.js 15, NestJS 11, PostgreSQL, and TypeScript with strict type safety (`exactOptionalPropertyTypes: true`)
- Architected a monorepo with pnpm workspaces, shared TypeScript configs, and unified ESLint/Prettier tooling across API and web apps
- Implemented typed API client layer with TanStack Query, Zustand state management, and automatic JWT token refresh

## Backend & API Design
- Designed and implemented a RESTful API with Swagger documentation (OpenAPI), JWT authentication, and role-based access control (USER/ADMIN)
- Built a complete Prisma ORM data layer with 12+ models, relations, and migrations in a PostgreSQL database
- Implemented CQRS-lite pattern with separate read/write concerns and optimized query paths

## Event-Driven Architecture
- Designed and implemented event-driven architecture using the Transactional Outbox Pattern for reliable event publishing
- Integrated RabbitMQ (amqp-connection-manager) for async inter-service communication with publisher/consumer patterns
- Implemented event consumers for Search indexing, In-app notifications, and Analytics tracking with graceful error handling

## Search & Performance
- Integrated Meilisearch for full-text search with filterable attributes (platform, category, discount), sortable fields, and relevance ranking
- Built a reindex script for bulk search index management with index configuration (searchable/filterable/sortable attributes)
- Implemented search consumer that auto-indexes approved deals and removes rejected/expired deals in real-time

## Data Ingestion Pipeline
- Built a platform-agnostic ingestion module with Adapter Pattern (Factory pattern) supporting Shopee, Lazada, TikTok Shop, CSV, and JSON imports
- Implemented idempotency checks using externalId to prevent duplicate deals across multiple import sources
- Normalized heterogeneous data formats from different e-commerce platforms into a unified DealDTO schema

## Observability & DevOps
- Configured Pino structured JSON logging for production with pretty-print dev mode for local development
- Implemented comprehensive health checks (/health, /health/live, /health/ready) using @nestjs/terminus with database ping
- Set up GitHub Actions CI/CD pipeline with lint, typecheck, build, and Playwright E2E smoke test jobs
- Configured Next.js standalone output for optimized Vercel deployment with image optimization

## Frontend & UX
- Built 12+ pages with responsive design using Tailwind CSS and a custom saffron/gold design system
- Implemented loading skeletons, error states, and empty states across all pages following Hallmark design audit guidelines
- Used @tanstack/react-table for the Admin dashboard with server-side pagination, sorting, and filtering
- Created real-time notification system with SSE (Server-Sent Events) for live unread count updates

## Security & Quality
- Implemented JWT authentication with access/refresh token pattern and secure HTTP-only cookie storage
- Applied input validation with class-validator DTOs, whitelist mode, and transform on all API endpoints
- Configured CORS with configurable origin, RBAC middleware for ADMIN-only endpoints, and Swagger Bearer auth
- Used ESLint with strict rules (unicorn, prettier, import sort) and TypeScript strict mode across the entire codebase
