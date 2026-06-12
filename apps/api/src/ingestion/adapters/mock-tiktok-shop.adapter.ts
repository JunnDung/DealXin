import { Injectable } from "@nestjs/common";

import {
  type AdapterParseResult,
  type NormalizedDealInput,
  type RawDealItem,
  type SourceAdapter,
} from "./source-adapter.interface";

const MOCK_TIKTOK_DEALS: RawDealItem[] = [
  {
    externalId: "tiktok_tt001",
    title: "Áo Hoodie Unisex - Minimalist Design - Cotton 300gsm",
    description:
      "Áo Hoodie nam nữ unisex, chất liệu cotton 300gsm, form rộng oversize.",
    sourceUrl: "https://tiktok.com/@shop/item/tt001",
    imageUrl: "https://p16.muscdn.com/img/tiktok-image-tt001.jpg",
    originalPrice: 450000,
    salePrice: 299000,
    currency: "VND",
    platform: "TIKTOK_SHOP",
    rawData: { shop_name: "Minimalist Fashion VN", trending_score: 95 },
  },
  {
    externalId: "tiktok_tt002",
    title: "Son Kem Lì 3CE Velvet Tint - Bộ 3 màu hot",
    description:
      "Son kem lì 3CE velvet tint - Bộ 3 màu hot nhất 2026. Lì mịn, bám màu 8h.",
    sourceUrl: "https://tiktok.com/@shop/item/tt002",
    imageUrl: "https://p16.muscdn.com/img/tiktok-image-tt002.jpg",
    originalPrice: 890000,
    salePrice: 590000,
    currency: "VND",
    platform: "TIKTOK_SHOP",
    rawData: { shop_name: "Korean Beauty VN", trending_score: 88 },
  },
  {
    externalId: "tiktok_tt003",
    title: "MacBook Air M2 256GB - Giảm sốc chỉ hôm nay",
    description:
      "MacBook Air M2 256GB - Starlight. Chip M2, RAM 8GB, màn hình Retina.",
    sourceUrl: "https://tiktok.com/@shop/item/tt003",
    imageUrl: "https://p16.muscdn.com/img/tiktok-image-tt003.jpg",
    originalPrice: 28990000,
    salePrice: 24990000,
    currency: "VND",
    platform: "TIKTOK_SHOP",
    rawData: {
      shop_name: "Tech Deal VN",
      live_stream_id: "ls_123456",
      views: 50000,
    },
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class MockTiktokShopAdapter implements SourceAdapter {
  readonly sourceType = "TIKTOK_SHOP" as const;
  readonly sourceName = "TikTok Shop";

  async fetch(options?: Record<string, unknown>): Promise<AdapterParseResult> {
    await sleep(500);

    let items = [...MOCK_TIKTOK_DEALS];

    if (options?.["filter"]) {
      const filter = String(options["filter"]).toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(filter) ||
          item.description?.toLowerCase().includes(filter),
      );
    }

    if (options?.["externalId"]) {
      const externalId = String(options["externalId"]);
      items = items.filter((item) => item.externalId === externalId);
    }

    return {
      items,
      metadata: {
        totalItems: items.length,
        page: 1,
        hasMore: false,
        source: "mock",
      },
    };
  }

  async parse(
    _input: Buffer | string,
    options?: Record<string, unknown>,
  ): Promise<AdapterParseResult> {
    return this.fetch(options);
  }

  normalize(item: RawDealItem): NormalizedDealInput {
    const discountPercent = Math.round(
      (1 - item.salePrice / item.originalPrice) * 100,
    );

    return {
      title: item.title,
      description: item.description,
      platform: "TIKTOK_SHOP",
      sourceUrl: item.sourceUrl,
      imageUrl: item.imageUrl,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      discountPercent,
      currency: item.currency ?? "VND",
      externalId: item.externalId,
      rawData: item.rawData,
    };
  }
}
