export interface CreateDealData {
  title: string;
  slug: string;
  description?: string;
  platform: "SHOPEE" | "LAZADA" | "TIKTOK_SHOP" | "OTHER";
  sourceUrl?: string;
  imageUrl?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency?: string;
  expiredAt?: Date;
  categoryId?: string;
  sourceId?: string;
  createdById: string;
}

export interface UpdateDealData {
  title?: string;
  description?: string;
  sourceUrl?: string;
  imageUrl?: string;
  originalPrice?: number;
  salePrice?: number;
  discountPercent?: number;
  categoryId?: string;
  expiredAt?: Date;
  [key: string]: unknown;
}

export interface DealFilterParams {
  [key: string]: unknown;
  platform?: string;
  categoryId?: string;
  status?: string;
  minDiscount?: number;
  maxDiscount?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface DealRepository {
  create(data: CreateDealData): Promise<unknown>;
  findById(id: string): Promise<unknown>;
  findBySlug(slug: string): Promise<unknown>;
  findMany(
    parameters: DealFilterParams,
  ): Promise<{ data: unknown[]; total: number }>;
  update(id: string, data: UpdateDealData): Promise<unknown>;
  updateStatus(id: string, status: string): Promise<unknown>;
  incrementViewCount(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  count(where: Record<string, unknown>): Promise<number>;
}
