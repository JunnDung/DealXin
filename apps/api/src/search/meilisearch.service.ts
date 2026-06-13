import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { type Index, MeiliSearch } from "meilisearch";

export interface DealDocument {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  platform: string;
  categoryId?: string;
  categoryName?: string;
  salePrice: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl?: string;
  sourceUrl?: string;
  score?: number;
  viewCount?: number;
  upvoteCount?: number;
  status: string;
  expiredAt?: string | null;
  createdAt: string;
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private readonly client: MeiliSearch;
  private readonly indexName = "deals";
  private index: Index<DealDocument>;

  constructor() {
    const host = process.env.MEILISEARCH_HOST || "http://localhost:7700";
    const apiKey = process.env.MEILISEARCH_API_KEY || "masterKey";

    this.client = new MeiliSearch({ host, apiKey });
    this.index = this.client.index<DealDocument>(this.indexName);
  }

  async onModuleInit() {
    try {
      await this.configureIndex();
    } catch (error) {
      this.logger.warn(
        `Meilisearch connection failed: ${error instanceof Error ? error.message : "Unknown error"}. Search functionality will be unavailable.`,
      );
    }
  }

  async configureIndex(): Promise<void> {
    try {
      await this.index.updateSettings({
        searchableAttributes: [
          "title",
          "description",
          "platform",
          "categoryName",
        ],
        filterableAttributes: [
          "platform",
          "categoryId",
          "status",
          "discountPercent",
        ],
        sortableAttributes: [
          "createdAt",
          "discountPercent",
          "salePrice",
          "score",
        ],
        rankingRules: [
          "words",
          "typo",
          "proximity",
          "attribute",
          "sort",
          "exactness",
          "score:desc",
        ],
      });
      this.logger.log("Meilisearch index configured successfully");
    } catch (error) {
      this.logger.error(
        `Failed to configure Meilisearch index: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async indexDeal(deal: DealDocument): Promise<void> {
    try {
      await this.index.addDocuments([deal]);
      this.logger.debug(`Indexed deal: ${deal.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to index deal ${deal.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async removeDeal(dealId: string): Promise<void> {
    try {
      await this.index.deleteDocument(dealId);
      this.logger.debug(`Removed deal from index: ${dealId}`);
    } catch (error) {
      this.logger.error(
        `Failed to remove deal ${dealId} from index: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async search(
    query: string,
    options?: {
      filter?: string | undefined;
      sort?: string[] | undefined;
      limit?: number | undefined;
      offset?: number | undefined;
    },
  ): Promise<{
    hits: DealDocument[];
    estimatedTotalHits: number;
    totalHits: number;
    processingTimeMs: number;
  }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchParams: any = {};
      if (options?.filter !== undefined) searchParams.filter = options.filter;
      if (options?.sort !== undefined) searchParams.sort = options.sort;
      if (options?.limit !== undefined) searchParams.limit = options.limit;
      if (options?.offset !== undefined) searchParams.offset = options.offset;

      const result = await this.index.search(query, searchParams);
      return {
        hits: result.hits as DealDocument[],
        estimatedTotalHits: result.estimatedTotalHits ?? 0,
        totalHits:
          ((result as Record<string, unknown>).totalHits as number) ?? 0,
        processingTimeMs: result.processingTimeMs,
      };
    } catch (error) {
      this.logger.error(
        `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async reindexAll(deals: DealDocument[]): Promise<void> {
    try {
      await this.index.deleteAllDocuments();
      if (deals.length > 0) {
        await this.index.addDocuments(deals);
      }
      this.logger.log(`Reindexed ${deals.length} deals`);
    } catch (error) {
      this.logger.error(
        `Failed to reindex deals: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }
}
