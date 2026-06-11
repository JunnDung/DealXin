# ADR-0003: Event Broker Choice — RabbitMQ

**Status**: Accepted
**Date**: 2026-06-11
**Deciders**: DealXin project lead

---

## Decision

Use **RabbitMQ** as the message broker for event-driven communication.

---

## Reasoning

### Why RabbitMQ?

1. **Simplicity**: AMQP protocol is well-understood and easy to explain in interviews.
2. **Mature**: Stable for 15+ years, extensive documentation, wide adoption.
3. **Work queues**: Natural fit for the outbox pattern (dead letter queues, message acknowledgment).
4. **Management UI**: Built-in RabbitMQ Management UI via Docker — useful for debugging during development.
5. **Acknowledgment model**: Supports both `manual` and `auto` ack, essential for the Outbox pattern.
6. **Declarative exchanges**: Easy to define topic/direct exchanges that map cleanly to our event contracts.

### Why Not Kafka?

1. **Complexity**: Kafka requires ZooKeeper/KRaft, understanding of partitions, offsets, consumer groups — significant overhead for an intern portfolio project.
2. **Resource heavy**: Kafka needs more memory and disk than RabbitMQ for the same workload.
3. **Overkill**: Our message volume (deal events, notifications) is low — Kafka's throughput is unnecessary.
4. **Harder to explain**: Kafka's architecture is complex. RabbitMQ's exchanges/queues model is more intuitive for demonstration.

### Why Not Redis Streams?

1. **Not a message broker**: Redis Streams are great for simple queues but lack durable message persistence and dead letter handling.
2. **Limited routing**: No exchange model like RabbitMQ.

---

## Queue Architecture

```
Exchange: dealxin.events (topic)
├── routing key: deal.approved     → queue: notification.deal.approved
├── routing key: deal.rejected    → queue: notification.deal.rejected
├── routing key: deal.expired     → queue: notification.deal.expired
├── routing key: deal.approved    → queue: search.index  (also)
├── routing key: deal.approved    → queue: analytics.events
└── routing key: price.changed    → queue: notification.price.alert
```

### Outbox Pattern

```
1. Transaction: INSERT deal + INSERT outbox_event (same DB transaction)
2. Outbox Worker: polls outbox_event table, publishes to RabbitMQ
3. Acknowledgment: marks outbox_event as published
4. Consumer: reads from queue, processes, acks
5. Idempotency: consumer checks if event was already processed
```

---

## Consequences

### Positive
- Durable messaging with acknowledgments
- Dead letter queue for failed messages
- Easy to monitor via Management UI
- Scales to multiple consumers
- Demonstrates event-driven architecture

### Negative
- Another Docker container to manage
- Polling-based outbox worker (can be upgraded to Change Data Capture later)
- Message ordering not guaranteed across consumers

### Mitigation
- Outbox worker runs as a NestJS `OnModuleInit` + interval cron
- Idempotency keys on every event payload
- Prometheus metrics from RabbitMQ exporter for observability
