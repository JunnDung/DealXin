# ADR-002: Adapter Pattern — Data Ingestion Design

**Status**: Accepted
**Date**: 2026-06-12
**Deciders**: DealXin project lead

---

## Decision

Use the **Adapter Pattern** combined with the **Factory Pattern** to build the data ingestion pipeline. Each ecommerce platform (Shopee, Lazada, TikTok Shop) has its own data format, so a dedicated adapter normalizes data into a unified `NormalizedDealInput`.

---

## Problem: Heterogeneous Data Sources

Each platform returns deals in a completely different format:

```typescript
// Shopee format
{ item_id: "123", item_name: "...", item_price: 199000, ... }

// Lazada format
{ productId: "abc", name: "...", price: { sold_price: "199000.00" }, ... }

// TikTok Shop format
{ product_id: "xyz", product_name: "...", price: { price: 199000 }, ... }
```

The ingestion service needs to handle all of these, and future platforms, without becoming a mess of `if/else` chains.

---

## Solution: Adapter + Factory

### Unified Interface

```typescript
// apps/api/src/ingestion/adapters/source-adapter.interface.ts
export interface SourceAdapter {
  /** Platform identifier */
  readonly sourceType: string;

  /**
   * Fetch normalized deals from this platform.
   * Returns an empty array on error (logged).
   */
  fetch(): Promise<NormalizedDealInput[]>;
}
```

### Normalized Output

```typescript
// All adapters return this unified format:
interface NormalizedDealInput {
  externalId: string;    // Unique ID from source platform
  title: string;
  description?: string;
  platform: Platform;
  sourceUrl?: string;
  imageUrl?: string;
  originalPrice: number;
  salePrice: number;
  currency: string;
  categoryName?: string;
}
```

### Factory Resolution

```typescript
// apps/api/src/ingestion/adapters/source-adapter.factory.ts
@Injectable()
export class SourceAdapterFactory {
  constructor(
    private readonly shopeeAdapter: MockShopeeAdapter,
    private readonly lazadaAdapter: MockLazadaAdapter,
    private readonly tiktokAdapter: MockTikTokShopAdapter,
  ) {}

  getAdapter(sourceType: string): SourceAdapter {
    switch (sourceType) {
      case "shopee": return this.shopeeAdapter;
      case "lazada": return this.lazadaAdapter;
      case "tiktok": return this.tiktokAdapter;
      default: throw new BadRequestException(`Unknown source: ${sourceType}`);
    }
  }
}
```

### Adapter Implementation Example

```typescript
// apps/api/src/ingestion/adapters/mock-shopee.adapter.ts
@Injectable()
export class MockShopeeAdapter implements SourceAdapter {
  readonly sourceType = "shopee";

  async fetch(): Promise<NormalizedDealInput[]> {
    // Simulates Shopee API call with 500ms delay
    const rawDeals = await this.fetchFromShopeeAPI();

    return rawDeals.map((raw) => ({
      externalId: raw.item_id,
      title: raw.item_name,
      platform: "SHOPEE" as Platform,
      originalPrice: raw.original_price ?? raw.item_price,
      salePrice: raw.item_price,
      // ... normalize all fields
    }));
  }
}
```

---

## Ingestion Pipeline Flow

```
POST /ingestion/crawl/shopee
       │
       ▼
IngestionController.crawl()
       │
       ▼
IngestionService.crawl("shopee")
       │
       ├─► SourceAdapterFactory.getAdapter("shopee")
       │         │
       │         ▼
       │    MockShopeeAdapter.fetch()
       │         │  (returns NormalizedDealInput[])
       │         ▼
       │    Normalize each deal
       │         │
       │         ▼
       ├─► Idempotency check (externalId exists?)
       │         │  Skip if duplicate
       │         ▼
       ├─► Upsert to PostgreSQL (create or update)
       │         │  DealsService.createDeal()
       │         │  → AuditLog
       │         │  → OutboxEvent
       │         ▼
       └─► Update CrawlerJob status
```

---

## Idempotency

Each adapter normalizes the source's unique `externalId`. Before creating a deal, the service checks if a deal with that `externalId` already exists:

```typescript
const existing = await this.prisma.deal.findFirst({
  where: { sourceId: source.id, externalId: normalized.externalId }
});
if (existing) {
  // Skip — already imported
  return { skipped: true, deal: existing };
}
return { skipped: false, deal: await this.createDeal(normalized) };
```

This prevents duplicate deals when the same feed is crawled multiple times.

---

## Why Not a Single Crawler Service?

| Approach | Pros | Cons |
|---|---|---|
| Separate adapters | Clean separation, easy to test, easy to add platform | More boilerplate |
| Single crawler | Less code, simpler | Giant `if/else` for formats, hard to test |

The adapter approach is more code but produces cleaner, more maintainable code that demonstrates the pattern well in interviews.

---

## Consequences

### Positive
- **Platform isolation**: Each platform's logic is isolated in its own class
- **Testability**: Each adapter can be unit tested independently with mock data
- **Extensibility**: Adding a new platform = create new adapter class, register in factory
- **Maintainability**: No `if (platform === 'shopee')` scattered throughout the codebase

### Negative
- **Boilerplate**: Each adapter requires similar structure
- **Factory coupling**: Factory needs to import all adapters
- **Normalization drift**: Different adapters might normalize the same field differently

### Mitigation
- Use TypeScript interfaces to enforce consistency
- All adapters follow the same fetch → normalize → return pattern
- Normalization logic is documented in the interface JSDoc
