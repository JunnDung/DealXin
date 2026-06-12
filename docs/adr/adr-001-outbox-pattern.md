# ADR-001: Outbox Pattern — Event Publishing Strategy

**Status**: Accepted
**Date**: 2026-06-12
**Deciders**: DealXin project lead

---

## Decision

Use the **Transactional Outbox Pattern** for reliable event publishing. Events are written to an `OutboxEvent` table in the same database transaction as business data, then published to RabbitMQ by a background polling worker.

---

## Problem: The Dual-Write Problem

When a deal is approved, we need to:
1. Update the deal status in PostgreSQL
2. Publish a `DealApproved` event to RabbitMQ

If step 1 succeeds but step 2 fails, the database shows "approved" but no downstream consumers (search indexer, notification creator) are notified. This is a **dual-write failure** — the system becomes inconsistent.

---

## Solution: Outbox Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Transaction                     │
│                                                             │
│  UPDATE deals SET status='APPROVED' WHERE id=?;            │
│  INSERT INTO outbox_event (aggregateType, eventType, ...)   │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Commit
                           ▼
              ┌────────────────────────┐
              │  OutboxEvent Table      │
              │  (published = false)   │
              └───────────┬────────────┘
                          │ poll every 2s
                          ▼
              ┌────────────────────────┐
              │ OutboxPublisher Worker  │
              │                       │
              │ 1. SELECT unpublished │
              │ 2. Publish to RMQ    │
              │ 3. UPDATE published   │
              └───────────┬────────────┘
                          │ Confirm
                          ▼
              ┌────────────────────────┐
              │     RabbitMQ          │
              └───────────┬────────────┘
                          │
              ┌──────────┴──────────┐
              ▼                       ▼
     ┌────────────────┐    ┌─────────────────┐
     │ SearchConsumer │    │NotificationCon │
     │ → indexDeal()  │    │ → createNotif() │
     └────────────────┘    └─────────────────┘
```

---

## Implementation

### Database Table

```sql
CREATE TABLE "OutboxEvent" (
  id          String   @id @default(uuid()),
  aggregateType String,  -- e.g. "Deal"
  aggregateId   String,  -- e.g. deal ID
  eventType   String,  -- e.g. "search.index" (routing key)
  payload     String,  -- JSON-serialized event
  published   Boolean @default(false),
  publishedAt DateTime?,
  createdAt   DateTime @default(now())
);
```

### Writing Events (in Transaction)

```typescript
// Inside DealsService.approveDeal() transaction:
await this.prisma.$transaction(async (tx) => {
  // 1. Update deal
  await tx.deal.update({ where: { id }, data: { status: "APPROVED" }});

  // 2. Write to outbox (atomic with deal update)
  await tx.outboxEvent.create({
    data: {
      aggregateType: "Deal",
      aggregateId: id,
      eventType: "search.index", // routing key = queue name
      payload: JSON.stringify({
        eventType: "DEAL_APPROVED",
        payload: { dealId: id, title: updated.title, ... }
      }),
      published: false,
    }
  });

  // 3. Create notification for user
  await tx.notification.create({ ... });
});
```

### Publishing Worker

```typescript
// OutboxPublisherService — runs every 2 seconds
async publishPending() {
  const events = await this.prisma.outboxEvent.findMany({
    where: { published: false },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  for (const event of events) {
    const payload = JSON.parse(event.payload);
    // routing key = eventType = queue name
    await this.messagingService.publish(event.eventType, payload);
    await this.prisma.outboxEvent.update({
      where: { id: event.id },
      data: { published: true, publishedAt: new Date() },
    });
  }
}
```

---

## Why Not Direct Publishing?

| Approach | Pros | Cons |
|---|---|---|
| Direct publish | Simple, no extra table | Dual-write failure possible |
| Outbox pattern | Guaranteed consistency | Extra complexity, 2s delay |
| CDC (Change Data Capture) | No app changes | Kafka required, complex setup |

For an intern portfolio project, the Outbox Pattern demonstrates understanding of distributed systems consistency without the full complexity of Kafka-based CDC.

---

## Consequences

### Positive
- **Strong consistency**: If the DB transaction commits, the event WILL be published (eventually)
- **At-least-once delivery**: Consumers must be idempotent, but no events are lost
- **Auditable**: OutboxEvent table is a complete event log
- **Resumeable**: Worker can resume from last unpublished event after restart
- **Interview value**: Demonstrates understanding of distributed systems patterns

### Negative
- **Delay**: Events published ~2s after DB commit (polling interval)
- **Complexity**: Extra table and worker to maintain
- **Idempotency burden**: All consumers must handle duplicates

### Mitigation
- 2s polling is acceptable for deal moderation (not real-time trading)
- Consumers use `eventId` as idempotency key
- Worker logs every publish for debugging
