import { Injectable } from '@nestjs/common';
import {
  SourceAdapter,
  RawDealItem,
  AdapterParseResult,
  NormalizedDealInput,
} from './source-adapter.interface';

const MOCK_SHOPEE_DEALS: RawDealItem[] = [
  {
    externalId: 'shopee_sp001',
    title: 'iPhone 16 Pro 256GB - Giảm 3 triệu chỉ hôm nay',
    description: 'iPhone 16 Pro 256GB Natural Titanium. Chip A18 Pro, Camera 48MP, Pin 4685mAh.',
    sourceUrl: 'https://shopee.vn/iphone-16-pro-256gb-natural-titanium-sp001',
    imageUrl: 'https://cf.shopee.vn/file/sg-11134201-7rd0l-shopeeiphone001',
    originalPrice: 39990000,
    salePrice: 36990000,
    currency: 'VND',
    platform: 'SHOPEE',
    rawData: { shop_name: 'Apple Flagship Store VN', location: 'TP.HCM', flash_sale: true },
  },
  {
    externalId: 'shopee_sp002',
    title: 'Samsung Galaxy S25 Ultra 512GB - 5G',
    description: 'Samsung Galaxy S25 Ultra 512GB - Titan Black. Chip Snapdragon 8 Elite, RAM 16GB.',
    sourceUrl: 'https://shopee.vn/samsung-galaxy-s25-ultra-512gb-sp002',
    imageUrl: 'https://cf.shopee.vn/file/sg-11134201-7rd0l-samsung001',
    originalPrice: 32990000,
    salePrice: 27990000,
    currency: 'VND',
    platform: 'SHOPEE',
    rawData: { shop_name: 'Samsung Official Store', location: 'Hà Nội', rating: 4.9 },
  },
  {
    externalId: 'shopee_sp003',
    title: 'Tai Nghe AirPods Pro 2 USB-C',
    description: 'AirPods Pro 2 với USB-C, Chống ồn chủ động, Spatial Audio.',
    sourceUrl: 'https://shopee.vn/airpods-pro-2-usbc-sp003',
    imageUrl: 'https://cf.shopee.vn/file/sg-11134201-7rd0l-airpods001',
    originalPrice: 7900000,
    salePrice: 5490000,
    currency: 'VND',
    platform: 'SHOPEE',
    rawData: { shop_name: 'Apple Authorized Reseller', verified: true },
  },
  {
    externalId: 'shopee_sp004',
    title: 'MacBook Air M3 15 inch 256GB - 2024',
    description: 'MacBook Air M3 15 inch 256GB - Midnight. Chip M3, RAM 8GB, màn hình Liquid Retina.',
    sourceUrl: 'https://shopee.vn/macbook-air-m3-15-inch-sp004',
    imageUrl: 'https://cf.shopee.vn/file/sg-11134201-7rd0l-mac001',
    originalPrice: 35990000,
    salePrice: 31990000,
    currency: 'VND',
    platform: 'SHOPEE',
    rawData: { shop_name: 'Apple Authorized Reseller', location: 'Đà Nẵng' },
  },
  {
    externalId: 'shopee_sp005',
    title: 'Sony WH-1000XM5 - Chống ồn Chủ động NC',
    description: 'Tai nghe Sony WH-1000XM5 - Đen. Công nghệ chống ồn hàng đầu.',
    sourceUrl: 'https://shopee.vn/sony-wh-1000xm5-sp005',
    imageUrl: 'https://cf.shopee.vn/file/sg-11134201-7rd0l-sony001',
    originalPrice: 9990000,
    salePrice: 6990000,
    currency: 'VND',
    platform: 'SHOPEE',
    rawData: { shop_name: 'Sony Việt Nam Official', warranty: '12 tháng' },
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class MockShopeeAdapter implements SourceAdapter {
  readonly sourceType = 'SHOPEE' as const;
  readonly sourceName = 'Shopee';

  async fetch(options?: Record<string, unknown>): Promise<AdapterParseResult> {
    await sleep(500);

    let items = [...MOCK_SHOPEE_DEALS];

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
      platform: 'SHOPEE',
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
