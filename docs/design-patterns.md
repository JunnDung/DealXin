# DealXin — Design Patterns

> Last updated: 2026-06-12

This document describes every significant design pattern implemented in the DealXin codebase, with file references and explanations of WHY each pattern was chosen.

---

## 1. Repository Pattern

### What & Why

The Repository Pattern abstracts data access behind an interface. The service layer never calls Prisma directly — it goes through a repository. This makes it easy to swap implementations (e.g., add caching layer, or mock for tests).

### Implementation

```typescript
// apps/api/src/deals/repositories/deal.repository.ts
export interface DealRepository {
  create(data: CreateDealData): Promise<Deal>;
  findById(id: string): Promise<Deal | null>;
  findBySlug(slug: string): Promise<Deal | null>;
  findMany(params: DealFilterParams): Promise<{ data: Deal[]; total: number }>;
  update(id: string, data: UpdateDealData): Promise<Deal>;
  updateStatus(id: string, status: string): Promise<Deal>;
  incrementViewCount(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

// apps/api/src/deals/repositories/prisma-deal.repository.ts
@Injectable()
export class PrismaDealRepository implements DealRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.deal.findUnique({ where: { id } });
  }
  // ... full implementation
}
```

### Files
- `apps/api/src/deals/repositories/deal.repository.ts` — Interface
- `apps/api/src/deals/repositories/prisma-deal.repository.ts` — Implementation
- `apps/api/src/deals/deals.module.ts` — Token binding: `{ provide: DEAL_REPOSITORY, useClass: PrismaDealRepository }`

---

## 2. Strategy Pattern

### What & Why

The Deal status workflow has different rules for each transition. A USER can submit, an ADMIN can approve/reject/expire, and users cannot modify their own deals' status. The Strategy Pattern encapsulates each transition rule.

### Implementation

```typescript
// apps/api/src/deals/strategies/index.ts
export interface DealStatusTransitionStrategy {
  validateTransition(params: {
    currentStatus: DealStatus;
    targetStatus: DealStatus;
    userRole: string;
    dealCreatedById: string;
    requestingUserId: string;
  }): void; // throws BadRequestException on invalid transition
}

@Injectable()
export class DefaultDealStatusTransitionStrategy implements DealStatusTransitionStrategy {
  validateTransition(params) {
    const { currentStatus, targetStatus, userRole } = params;

    // PENDING → APPROVED: only ADMIN
    if (currentStatus === "PENDING" && targetStatus === "APPROVED") {
      if (userRole !== "ADMIN") {
        throw new ForbiddenException("Only admins can approve deals");
      }
    }
    // ... similar rules for all transitions
  }
}
```

### Files
- `apps/api/src/deals/strategies/index.ts` — Strategy interface
- `apps/api/src/deals/strategies/` — Default implementation
- `apps/api/src/deals/deals.module.ts` — `{ provide: DEAL_STATUS_STRATEGY, useClass: DefaultDealStatusTransitionStrategy }`

---

## 3. Adapter Pattern (Factory)

### What & Why

Each ecommerce platform (Shopee, Lazada, TikTok Shop) has a completely different API format, pagination style, and data schema. The Adapter Pattern isolates platform-specific logic behind a unified interface.

### Implementation

```typescript
// apps/api/src/ingestion/adapters/source-adapter.interface.ts
export interface SourceAdapter {
  readonly sourceType: string;
  fetch(): Promise<NormalizedDealInput[]>;
}

// apps/api/src/ingestion/adapters/mock-shopee.adapter.ts
@Injectable()
export class MockShopeeAdapter implements SourceAdapter {
  readonly sourceType = "shopee";
  async fetch(): Promise<NormalizedDealInput[]> {
    // Platform-specific logic (mock for demo)
    return deals.map(normalizeShopeeFormat);
  }
}

// apps/api/src/ingestion/adapters/source-adapter.factory.ts
@Injectable()
export class SourceAdapterFactory {
  getAdapter(sourceType: string): SourceAdapter {
    switch (sourceType) {
      case "shopee": return new MockShopeeAdapter();
      case "lazada": return new MockLazadaAdapter();
      // ...
    }
  }
}
```

### Files
- `apps/api/src/ingestion/adapters/source-adapter.interface.ts` — Unified interface
- `apps/api/src/ingestion/adapters/mock-shopee.adapter.ts`
- `apps/api/src/ingestion/adapters/mock-lazada.adapter.ts`
- `apps/api/src/ingestion/adapters/mock-tiktok-shop.adapter.ts`
- `apps/api/src/ingestion/adapters/source-adapter.factory.ts`
- `apps/api/src/ingestion/ingestion.service.ts` — Uses factory

---

## 4. Outbox Pattern (Transactional Outbox)

### What & Why

The classic dual-write problem: if you write to the DB and then publish to RabbitMQ, and the publish fails, your system is in an inconsistent state. The Outbox Pattern solves this by writing the event to an OutboxEvent table in the same DB transaction as the business data.

### Implementation

```typescript
// apps/api/src/common/outbox.service.ts — writes to outbox in same tx
async emit(aggregateType, aggregateId, eventType, payload) {
  await this.prisma.outboxEvent.create({
    data: { aggregateType, aggregateId, eventType, payload: JSON.stringify(payload), published: false }
  });
}

// Called inside DealsService.approveDeal() transaction:
// 1. UPDATE deal SET status = 'APPROVED'
// 2. INSERT audit_log
// 3. INSERT outbox_event ← atomic with step 1

// apps/api/src/common/outbox-publisher.service.ts — polls outbox, publishes
async publishPending() {
  const events = await this.prisma.outboxEvent.findMany({
    where: { published: false }, take: 50, orderBy: { createdAt: 'asc' }
  });
  for (const event of events) {
    const payload = JSON.parse(event.payload);
    await this.messagingService.publish(event.eventType, payload); // routing key = queue name
    await this.prisma.outboxEvent.updateMany({
      where: { id: { in: idsToMark } },
      data: { published: true, publishedAt: new Date() },
    });
  }
}
```

### Files
- `apps/api/src/common/outbox.service.ts` — Outbox write service
- `apps/api/src/common/outbox-publisher.service.ts` — Polling publisher worker
- `apps/api/src/common/outbox.module.ts` — Module registration
- `apps/api/src/common/outbox-publishing.module.ts` — Standalone publisher module
- `apps/api/src/deals/deals.service.ts` — Uses outbox in transactions

---

## 5. CQRS-lite

### What & Why

CQRS (Command Query Responsibility Segregation) means writes and reads use different models. In DealXin, writes go through the PostgreSQL database (via Prisma), while reads for search go through Meilisearch. This separates concerns: the DB is the source of truth, Meilisearch is an eventually-consistent read model.

### Implementation

| Operation | Model | Flow |
|---|---|---|
| Create deal | PostgreSQL | Service → Prisma → DB |
| Read deal | PostgreSQL | Service → Prisma → DB |
| Search deals | Meilisearch | SearchService → Meilisearch |
| Update deal | PostgreSQL + Meilisearch | Service → Prisma + Outbox → Consumer → Meilisearch |

### Files
- `apps/api/src/search/search.service.ts` — Read model (Meilisearch)
- `apps/api/src/deals/deals.service.ts` — Write model (PostgreSQL)
- `apps/api/src/messaging/consumers/search.consumer.ts` — Syncs writes → read model

---

## 6. Observer / Pub-Sub

### What & Why

When a deal is approved, multiple consumers need to react (index search, send notification, track analytics). Pub/Sub decouples the publisher (DealsService) from subscribers (Search, Notification, Analytics consumers).

### Implementation

```
DealsService.approveDeal()
  │
  ├─► OutboxEvent (DB write)
  │
  └─► MessagingService.publish(analytics.queue, event)
         │
         ▼
  ┌─────────────────────┬──────────────────┬──────────────┐
  │  AnalyticsConsumer  │ NotificationConsumer│ SearchConsumer│
  │  → AnalyticsEvent  │  → Notification    │ → Meilisearch │
  └─────────────────────┴──────────────────┴──────────────┘
```

### Files
- `apps/api/src/messaging/messaging.service.ts` — Pub/sub hub
- `apps/api/src/messaging/consumers/` — All subscribers
- `apps/api/src/messaging/routing-keys.ts` — Queue definitions

---

## 7. Dependency Injection

### What & Why

NestJS's built-in DI container manages all service instantiation. Controllers receive services via constructors, NestJS resolves dependencies recursively.

### Implementation

```typescript
// NestJS resolves this automatically:
// Module → Controller → Service → Repository → PrismaService → PrismaClient
@Controller("deals")
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}
  //                  ^ NestJS instantiates DealsService with all its deps
}

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    @Inject(DEAL_REPOSITORY) private readonly repository: DealRepository,
    //                                  ^ Token-based injection
    @Inject(DEAL_STATUS_STRATEGY) private readonly statusTransition: DealStatusTransitionStrategy,
    private readonly outbox: OutboxService,
    private readonly messagingService: MessagingService,
  ) {}
}
```

### Files
- All services use constructor injection
- `apps/api/src/deals/deals.module.ts` — Binds tokens to implementations
- `apps/api/src/deals/deals.tokens.ts` — Token constants

---

## 8. Module-Based Service Boundaries

### What & Why

NestJS modules create natural service boundaries within the monolith. Each module encapsulates its own controllers, services, repositories, and exports. This is the first step toward microservices extraction.

### Module Graph

```
AppModule
  ├─ AuthModule (exports: AuthService)
  ├─ DealsModule (exports: DealsService)
  ├─ IngestionModule
  ├─ SearchModule (exports: SearchService, MeilisearchService)
  ├─ NotificationModule (exports: NotificationService)
  ├─ AnalyticsModule (exports: AnalyticsService)
  ├─ CategoriesModule
  ├─ HealthModule
  ├─ MessagingModule (Global, exports: MessagingService)
  ├─ CommonModule
  │   ├─ OutboxModule (exports: OutboxService)
  │   └─ OutboxPublishingModule (exports: OutboxPublisherService)
  └─ PrismaModule (Global, exports: PrismaService)
```

---

## 9. Frontend State Management Patterns

### API Client Layer (TanStack Query)

```typescript
// apps/web/src/lib/api.ts — Centralized, typed API client
export const dealsApi = {
  list: (params: DealsQueryParams) =>
    apiFetch<PaginatedResponse<DealResponse>>(`/deals`, { query: params }),
  getBySlug: (slug: string) =>
    apiFetch<DealResponse>(`/deals/slug/${slug}`),
  bookmark: (id: string) =>
    apiFetch<{ message: string }>(`/deals/${id}/bookmark`, { method: "POST" }),
};
```

### Auth State (Zustand + persist middleware)

```typescript
// apps/web/src/hooks/use-auth.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      hydrate: () => set({ isHydrated: true }),
      login: async (email, password) => { /* fetch + setTokens + set user */ },
      logout: () => { /* clearTokens + set user: null */ },
    }),
    {
      name: "dx-auth",
      partialize: () => ({}), // tokens stored separately via HTTP cookie
      onRehydrateStorage: () => (state) => { state?.hydrate(); },
    }
  )
);
```

### Files
- `apps/web/src/lib/api.ts` — Typed API client (apiFetch wrapper)
- `apps/web/src/hooks/use-auth.ts` — Zustand auth store
- `apps/web/src/lib/query-client.ts` — TanStack Query client config

---

## 10. API Response Normalization

### What & Why

The `apiFetch` utility normalizes all API responses so callers don't need to know about HTTP details, token refresh, or error handling. Every API function returns a typed promise.

### Implementation

```typescript
// apps/web/src/lib/api.ts
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const res = await fetch(url, fetchOptions);

  if (res.status === 401 && !options?.skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch<T>(endpoint, { ...options, skipAuth: true });
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) { throw await parseError(res); }

  const json = await res.json();
  return (json.data ?? json) as T; // Handle both wrapped and bare responses
}
```

### Files
- `apps/web/src/lib/api.ts` — Full implementation
- All API function definitions in same file
