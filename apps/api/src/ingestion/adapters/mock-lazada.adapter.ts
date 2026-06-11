import { Injectable } from '@nestjs/common';
import {
  SourceAdapter,
  RawDealItem,
  AdapterParseResult,
  NormalizedDealInput,
} from './source-adapter.interface';

const MOCK_LAZADA_DEALS: RawDealItem[] = [
  {
    externalId: 'lazada_lz001',
    title: 'MacBook Air M3 15 inch 256GB - 2024',
    description: 'MacBook Air M3 15 inch 256GB - Space Gray. Chip M3 8-core CPU, GPU 10-core.',
    sourceUrl: 'https://www.lazada.com/products/macbook-air-m3-15-lz001',
    imageUrl: 'https://laz-img-cdn.alicdn.com/images/ls-abc123.jpg',
    originalPrice: 35990000,
    salePrice: 32990000,
    currency: 'VND',
    platform: 'LAZADA',
    rawData: { seller_name: 'Apple Authorized Reseller', location: 'Hà Nội' },
  },
  {
    externalId: 'lazada_lz002',
    title: 'Sony WH-1000XM5 Headphones - Đen',
    description: 'Tai nghe Sony WH-1000XM5 - Chống ồn chủ động NC, 30h pin.',
    sourceUrl: 'https://www.lazada.com/products/sony-wh1000xm5-lz002',
    imageUrl: 'https://laz-img-cdn.alicdn.com/images/ls-xyz789.jpg',
    originalPrice: 9990000,
    salePrice: 6990000,
    currency: 'VND',
    platform: 'LAZADA',
    rawData: { seller_name: 'Sony Việt Nam', warranty: '12 tháng chính hãng' },
  },
  {
    externalId: 'lazada_lz003',
    title: 'Samsung Galaxy Tab S10 Ultra 256GB',
    description: 'Samsung Galaxy Tab S10 Ultra 256GB WiFi - AMOLED 14.6 inch, S Pen included.',
    sourceUrl: 'https://www.lazada.com/products/galaxy-tab-s10-ultra-lz003',
    imageUrl: 'https://laz-img-cdn.alicdn.com/images/ls-tab001.jpg',
    originalPrice: 29990000,
    salePrice: 25990000,
    currency: 'VND',
    platform: 'LAZADA',
    rawData: { seller_name: 'Samsung Việt Nam', location: 'TP.HCM' },
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class MockLazadaAdapter implements SourceAdapter {
  readonly sourceType = 'LAZADA' as const;
  readonly sourceName = 'Lazada';

  async fetch(options?: Record<string, unknown>): Promise<AdapterParseResult> {
    await sleep(500);

    let items = [...MOCK_LAZADA_DEALS];

    if (options?.['filter']) {
      const filter = String(options['filter']).toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(filter) ||
          item.description?.toLowerCase().includes(filter),
      );
    }

    if (options?.['externalId']) {
      const externalId = String(options['externalId']);
      items = items.filter((item) => item.externalId === externalId);
    }

    return {
      items,
      metadata: {
        totalItems: items.length,
        page: 1,
        hasMore: false,
        source: 'mock',
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
      platform: 'LAZADA',
      sourceUrl: item.sourceUrl,
      imageUrl: item.imageUrl,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      discountPercent,
      currency: item.currency ?? 'VND',
      externalId: item.externalId,
      rawData: item.rawData,
    };
  }
}
