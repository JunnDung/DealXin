# ADR-0004: Search Engine Choice — Meilisearch

**Status**: Accepted
**Date**: 2026-06-11
**Deciders**: DealXin project lead

---

## Decision

Use **Meilisearch** as the full-text search engine for deal discovery.

---

## Reasoning

### Why Meilisearch?

1. **Speed**: Meilisearch is built in Rust — sub-millisecond search responses, critical for a deal platform where users want instant results.
2. **Developer experience**: Single binary, Docker one-liner, zero config for basic setup. Excellent for portfolio projects.
3. **Typo tolerance**: Built-in fuzzy matching handles Vietnamese text and short queries well.
4. **Filtering and sorting**: Native support for filterable attributes (platform, category, price range) and sortable attributes (discount, expiry, hot score).
5. **Relevance tuning**: Easy to configure ranking rules that match our product logic (hot score > recency > discount).
6. **HTTP API**: Language-agnostic client, simple to integrate from NestJS and document for interviews.

### Why Not PostgreSQL Full-Text Search?

1. **Performance**: Meilisearch is significantly faster for complex queries with multiple filters.
2. **Relevance**: Meilisearch's ranking algorithm is purpose-built for search relevance.
3. **Scalability**: Meilisearch handles millions of documents; Postgres FTS would degrade at scale.
4. **Features**: Typo tolerance, highlighting, faceted search — Meilisearch has these built-in.

### Why Not Elasticsearch / OpenSearch?

1. **Resource overhead**: Elasticsearch needs 2GB+ RAM minimum, too heavy for local development and demo purposes.
2. **Complexity**: Cluster setup, index mapping, version compatibility — significant overhead.
3. **Overkill**: Our search needs are moderate. Meilisearch handles 100K-1M documents easily.

### Why Not Algolia?

1. **Cost**: Algolia's free tier is limited, pricing escalates quickly.
2. **Proprietary**: Not self-hostable, reduces portfolio value.

---

## Search Index Design

```
Index: deals

Searchable attributes (priority order):
1. title
2. description
3. platform
4. category

Filterable attributes:
- platform
- categoryId
- status
- discountPercent
- salePrice
- expiredAt
- createdAt

Sortable attributes:
- createdAt (newest)
- discountPercent (best deal)
- score (hot)
- expiredAt (expiring soon)

Ranking rules:
1. words
2. typo
3. proximity
4. attribute
5. sort
6. exactness
7. score  ← custom hot score boost
```

---

## Sync Strategy

```
Phase 6+:
- Outbox event "DealApproved" → Search Consumer → Meilisearch
- Outbox event "DealExpired"  → Search Consumer → Meilisearch delete

Phase 7:
- Full reindex script: reads approved deals from DB → Meilisearch
```

---

## Consequences

### Positive
- Instant search results for users
- Faceted filtering without DB queries
- Typo tolerance for user-friendly search
- Self-hosted, no external dependency

### Negative
- Another Docker container
- Data sync complexity (DB ↔ Meilisearch consistency)
- Meilisearch cloud requires separate hosting if not self-hosting

### Mitigation
- Outbox pattern ensures eventual consistency between DB and search index
- Reindex script provides recovery from index corruption
- Search consumer logs failures for debugging
