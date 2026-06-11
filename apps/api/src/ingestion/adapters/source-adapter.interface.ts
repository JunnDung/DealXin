export type SourceType = 'SHOPEE' | 'LAZADA' | 'TIKTOK_SHOP' | 'JSON' | 'CSV';

export interface RawDealItem {
  externalId?: string;
  title: string;
  description?: string | undefined;
  sourceUrl?: string | undefined;
  imageUrl?: string | undefined;
  originalPrice: number;
  salePrice: number;
  currency?: string | undefined;
  platform: SourceType;
  rawData?: Record<string, unknown> | undefined;
}

export interface AdapterParseResult {
  items: RawDealItem[];
  metadata?: {
    totalItems?: number;
    page?: number;
    hasMore?: boolean;
    [key: string]: unknown;
  };
}

export interface SourceAdapter {
  readonly sourceType: SourceType;
  readonly sourceName: string;

  /** Fetch from external API (for crawler adapters) */
  fetch?(options?: Record<string, unknown>): Promise<AdapterParseResult>;

  /** Parse raw input data (for file adapters) */
  parse(input: Buffer | string, options?: Record<string, unknown>): Promise<AdapterParseResult>;

  /** Normalize raw adapter output to standard format */
  normalize(item: RawDealItem): NormalizedDealInput;
}

export interface NormalizedDealInput {
  title: string;
  description?: string | undefined;
  platform: 'SHOPEE' | 'LAZADA' | 'TIKTOK_SHOP' | 'OTHER';
  sourceUrl?: string | undefined;
  imageUrl?: string | undefined;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  externalId?: string | undefined;
  rawData?: Record<string, unknown> | undefined;
}
