# Deployment Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 17+ (or Supabase)
- Redis (or Upstash)
- RabbitMQ 3.x
- Meilisearch latest
- Docker + Docker Compose (optional)

## Environment Variables

### API (apps/api/.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dealxin"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="masterKey"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Server
PORT=3001
NODE_ENV="development"
LOG_LEVEL="debug"
```

### Web (apps/web/.env.local)

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### Production Web (.env.production)

```bash
NEXT_PUBLIC_API_URL="https://your-api-domain.com/api"
```

## Option 1: Docker Compose (Recommended for Local)

```bash
# Start all services
docker compose up -d

# Run migrations
cd apps/api && pnpm db:migrate:dev

# Seed data
cd apps/api && pnpm db:seed

# Start API
cd apps/api && pnpm dev

# Start Web (separate terminal)
cd apps/web && pnpm dev
```

## Option 2: Railway (Backend)

### Connect Repository

1. Create new Railway project
2. Connect GitHub repo
3. Select `apps/api` as the root

### Configure

- **Build Command**: `pnpm install --frozen-lockfile && pnpm prisma:generate && pnpm build`
- **Start Command**: `node dist/main.js`
- **Root Directory**: `apps/api`

### Environment Variables

Add all variables from the `.env` section above

### Database

Provision PostgreSQL via Railway dashboard and use the connection string as `DATABASE_URL`

### Add-ons to Provision

- PostgreSQL (DATABASE_URL)
- Redis (REDIS_URL)
- RabbitMQ (RABBITMQ_URL)

## Option 3: Vercel (Frontend)

```bash
cd apps/web
vercel --prod
```

### Environment Variables (Vercel Dashboard)

- `NEXT_PUBLIC_API_URL`: Your Railway/Render backend URL (e.g., `https://dealxin-api.up.railway.app/api`)

### Domain Configuration

- Set custom domain in Vercel dashboard
- Update `CORS_ORIGIN` in API to include your domain

## Option 4: Render (Backend Alternative)

1. Create Web Service
2. Connect GitHub repo
3. Root directory: `apps/api`
4. Build command: `pnpm install --frozen-lockfile && pnpm prisma:generate && pnpm build`
5. Start command: `node dist/main.js`
6. Add environment variables

## Option 5: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch
cd apps/api
fly launch

# Deploy
fly deploy
```

### fly.toml Configuration

```toml
[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"

[processes]
  web = "node dist/main.js"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

## Database Migrations

Always run migrations on deploy:

```bash
# Development
cd apps/api
pnpm db:migrate:dev

# Production
cd apps/api
DATABASE_URL="..." pnpm db:migrate:deploy

# Generate client after migrate
pnpm prisma:generate
```

## Meilisearch Setup

```bash
# Pull Docker image
docker pull getmeili/meilisearch:latest

# Run
docker run -d -p 7700:7700 \
  -e MEILI_MASTER_KEY="masterKey" \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:latest

# Configure index (via API)
curl -X POST 'http://localhost:7700/indexes' \
  -H 'Authorization: Bearer masterKey' \
  -H 'Content-Type: application/json' \
  -d '{"uid": "deals", "primaryKey": "id"}'
```

## Health Checks

After deployment, verify:

- `GET /api/health` — Full health check
- `GET /api/health/live` — Liveness probe
- `GET /api/health/ready` — Readiness probe

## Troubleshooting

### API Not Starting

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Run migrations manually
pnpm --filter api db:migrate:deploy

# Check Prisma client
pnpm --filter api prisma:generate
```

### CORS Errors

Ensure `CORS_ORIGIN` matches your frontend URL exactly (no trailing slash)

### Meilisearch Not Indexing

Check that `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY` are set correctly and the Meilisearch instance is reachable.

### RabbitMQ Connection Failed

Ensure `RABBITMQ_URL` is correct and RabbitMQ is reachable. For development, use `amqp://guest:guest@localhost:5672`.
