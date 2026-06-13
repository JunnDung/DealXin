import { Inject, Injectable, Logger } from "@nestjs/common";

import { MEILISEARCH_SERVICE } from "../common/di-tokens";
import { PRISMA_SERVICE } from "../prisma/prisma.constants";
import { type PrismaService } from "../prisma/prisma.service";
import { type MeilisearchService } from "./meilisearch.service";

export interface SearchDealsOptions {
  query: string;
  platform?: string | undefined;
  categoryId?: string | undefined;
  minDiscount?: number | undefined;
  maxDiscount?: number | undefined;
  sortBy?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(MEILISEARCH_SERVICE)
    private readonly meilisearch: MeilisearchService,
    @Inject(PRISMA_SERVICE) private readonly prisma: PrismaService,
  ) {}

  async searchDeals(options: SearchDealsOptions) {
    const {
      query,
      platform,
      categoryId,
      minDiscount,
      maxDiscount,
      sortBy,
      page = 1,
      limit = 20,
    } = options;

    const filters: string[] = [];
    if (platform) filters.push(`platform = "${platform}"`);
    if (categoryId) filters.push(`categoryId = "${categoryId}"`);
    if (minDiscount !== undefined)
      filters.push(`discountPercent >= ${minDiscount}`);
    if (maxDiscount !== undefined)
      filters.push(`discountPercent <= ${maxDiscount}`);

    let sort: string[] | undefined;
    if (sortBy === "newest") sort = ["createdAt:desc"];
    else if (sortBy === "discount") sort = ["discountPercent:desc"];
    else if (sortBy === "hot") sort = ["score:desc"];
    else if (sortBy === "price_asc") sort = ["salePrice:asc"];
    else if (sortBy === "price_desc") sort = ["salePrice:desc"];

    const filterString = filters.length > 0 ? filters.join(" AND ") : undefined;

    const result = await this.meilisearch.search(query, {
      filter: filterString,
      sort,
      limit,
      offset: (page - 1) * limit,
    });

    return {
      data: result.hits,
      meta: {
        total: result.estimatedTotalHits ?? result.totalHits ?? 0,
        page,
        limit,
        totalPages: Math.ceil(
          (result.estimatedTotalHits ?? result.totalHits ?? 0) / limit,
        ),
      },
    };
  }

  async reindexAll() {
    const deals = await this.prisma.deal.findMany({
      where: { status: "APPROVED" },
      include: {
        category: { select: { name: true } },
        _count: { select: { votes: true } },
      },
    });

    const documents = deals.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description ?? "",
      slug: d.slug,
      platform: d.platform,
      categoryId: d.categoryId ?? "",
      categoryName: d.category?.name ?? "",
      salePrice: d.salePrice,
      originalPrice: d.originalPrice,
      discountPercent: d.discountPercent,
      imageUrl: d.imageUrl ?? "",
      sourceUrl: d.sourceUrl ?? "",
      score: d.score,
      viewCount: d.viewCount,
      upvoteCount: d._count.votes,
      status: d.status,
      expiredAt: d.expiredAt?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
    }));

    await this.meilisearch.reindexAll(documents);
    this.logger.log(`Reindexed ${documents.length} deals`);
    return { indexed: documents.length };
  }
}
