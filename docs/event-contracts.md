# DealXin — Event Contracts

> Last updated: 2026-06-12

---

## Overview

All domain events follow a standard envelope format and are published via the Transactional Outbox Pattern through RabbitMQ.

### Event Envelope

Every event uses this envelope structure:

```typescript
interface DomainEventEnvelope {
  eventId: string;      // UUID v4, generated at event creation
  eventType: string;    // Human-readable event type
  occurredAt: string;   // ISO 8601 timestamp
  version: number;     // Schema version for forward compatibility
  payload: unknown;    // Event-specific payload
}
```

### Delivery Guarantees

| Delivery Type | Guarantee | Use Case |
|---|---|---|
| Outbox Pattern | At-least-once | Deal approval, rejection, expiration |
| Direct Publish | At-least-once | Analytics events (fire-and-forget) |
| Consumer idempotency | Exactly-once | All consumers must be idempotent |

All consumers **MUST** be idempotent — the same event may be delivered more than once in failure scenarios.

---

## Event Reference

### DealSubmitted

Emitted when a deal is created (via user submission, CSV/JSON import, or crawler).

```typescript
interface DealSubmittedEvent {
  eventId: string;
  eventType: "DEAL_SUBMITTED";
  occurredAt: string; // ISO 8601
  version: 1;
  payload: {
    dealId: string;
    title: string;
    slug: string;
    platform: Platform; // "SHOPEE" | "LAZADA" | "TIKTOK_SHOP" | "OTHER"
    categoryId: string;
    salePrice: number;
    originalPrice: number;
    discountPercent: number;
    sourceUrl: string;
    createdById: string;
  };
}
```

**Published via**: Outbox → `search.index` queue
**Consumer action**: None (pending deal, not yet searchable)

---

### DealApproved

Emitted when an admin approves a pending deal.

```typescript
interface DealApprovedEvent {
  eventId: string;
  eventType: "DEAL_APPROVED";
  occurredAt: string; // ISO 8601
  version: 1;
  payload: {
    dealId: string;
    title: string;
    slug: string;
    platform: Platform;
    categoryId: string;
    salePrice: number;
    originalPrice: number;
    discountPercent: number;
    sourceUrl: string;
    score: number;
  };
}
```

**Published via**: Outbox → `search.index` queue
**Consumer action**: Index deal in Meilisearch

---

### DealRejected

Emitted when an admin rejects a pending deal.

```typescript
interface DealRejectedEvent {
  eventId: string;
  eventType: "DEAL_REJECTED";
  occurredAt: string; // ISO 8601
  version: 1;
  payload: {
    dealId: string;
    title: string;
    reason?: string;
  };
}
```

**Published via**: Outbox → `search.index` queue
**Consumer action**: None (not in search index)

---

### DealExpired

Emitted when an admin marks a deal as expired.

```typescript
interface DealExpiredEvent {
  eventId: string;
  eventType: "DEAL_EXPIRED";
  occurredAt: string; // ISO 8601
  version: 1;
  payload: {
    dealId: string;
    slug: string;
  };
}
```

**Published via**: Outbox → `search.index` queue
**Consumer action**: Remove deal from Meilisearch index

---

### DealViewed

Emitted when a user views a deal detail page.

```typescript
interface DealViewedEvent {
  eventId: string;
  eventType: "PAGE_VIEW";
  occurredAt: string; // ISO 8601
  version: 1;
  payload: {
    dealId: string;
    userId?: string;
    metadata?: {
      platform?: string;
    };
  };
}
```

**Published via**: Direct publish to `analytics.process` queue (fire-and-forget)
**Consumer action**: Increment view count in AnalyticsEvent table

---

### DealVoted

Emitted when a user upvotes or downvotes a deal.

```typescript
interface DealVotedEvent {
  eventId: string;
  eventType: "DEAL_UPVOTE" | "DEAL_DOWNVOTE";
  occurredAt: string; // ISO 8601
  version: 1;
  payload: {
    dealId: string;
    userId: string;
    value: number; // 1 = upvote, -1 = downvote
    score: number; // Updated total score
  };
}
```

**Published via**: Direct publish to `analytics.process` queue
**Consumer action**: Track vote in AnalyticsEvent table

---

### DealBookmarked

Emitted when a user bookmarks or removes a bookmark.

```typescript
interface DealBookmarkedEvent {
  eventId: string;
  eventType: "DEAL_BOOKMARK";
  occurredAt: string; // ISO 8601
  version: 1;
  payload: {
    dealId: string;
    userId: string;
    action: "ADD" | "REMOVE";
  };
}
```

**Published via**: Direct publish to `analytics.process` queue
**Consumer action**: Track bookmark in AnalyticsEvent table

---

## Queue Architecture

```
Exchange: "" (default, direct to queue by routing key)
Type: direct

┌──────────────────────┐     routing key: search.index
│ OutboxPublisher     │──────────────────────────────►┌───────────────┐
└──────────────────────┘                            │ search.index │
                                                   └──────┬──────┘
                                                          │ msg.payload.eventType
                                                          ▼
                                                  ┌─────────────────┐
                                                  │ SearchConsumer  │
                                                  │                 │
                                                  │ DEAL_APPROVED  │→ indexDeal()
                                                  │ DEAL_REJECTED  │→ removeDeal()
                                                  │ DEAL_EXPIRED   │→ removeDeal()
                                                  └─────────────────┘

┌──────────────────────┐     routing key: analytics.process
│ MessagingService     │──────────────────────────────►┌─────────────────┐
│ (direct publish)    │                            │ analytics.process│
└──────────────────────┘                            └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │AnalyticsConsumer│
                                                  │                │
                                                  │ PAGE_VIEW       │→ trackEvent(VIEW)
                                                  │ DEAL_UPVOTE    │→ trackEvent(VOTE)
                                                  │ DEAL_BOOKMARK  │→ trackEvent(BOOKMARK)
                                                  │ DEAL_SUBMITTED │→ trackEvent(SUBMIT)
                                                  │ DEAL_APPROVED  │→ trackEvent(APPROVE)
                                                  │ DEAL_REJECTED  │→ trackEvent(REJECT)
                                                  └─────────────────┘
```

---

## Consumer Idempotency

Each consumer must handle duplicate messages gracefully:

| Consumer | Idempotency Strategy |
|---|---|
| `SearchConsumer` | Meilisearch upsert (same document, same ID = update) |
| `NotificationConsumer` | `dealId` + `eventType` + `occurredAt` as idempotency key; skip if already created |
| `AnalyticsConsumer` | `eventId` as unique key; skip if already exists |

### Notification Idempotency Example

```typescript
// NotificationConsumer handles DealApproved:
// Skip if notification for this dealId + type already exists in last 1 hour
const recent = await prisma.notification.findFirst({
  where: {
    dealId,
    type: "DEAL_APPROVED",
    createdAt: { gte: oneHourAgo },
  },
});
if (recent) return; // Already notified
```

---

## Versioning

Events are versioned at the envelope level (`version: 1`). When the payload schema changes:

1. Increment `version`
2. Add migration logic in consumer to handle both `v1` and `v2` payloads
3. Update this document with new schema
4. Consumers should log unknown versions for monitoring

---

## Monitoring

- **Dead Letter Queue**: Failed messages go to `DLX` (Dead Letter Exchange)
- **Retry**: Failed messages are requeued up to 3 times with exponential backoff
- **Logging**: Every consumer logs `eventType`, `eventId`, `dealId` at INFO level
- **Metrics**: Publish count, consume count, error count per queue
