import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";

import { MEILISEARCH_SERVICE, MESSAGING_SERVICE } from "../../common/di-tokens";
import { type MessagingService } from "../../messaging/messaging.service";
import { Queues } from "../../messaging/routing-keys";
import {
  type DealDocument,
  type MeilisearchService,
} from "../../search/meilisearch.service";

@Injectable()
export class SearchConsumer implements OnModuleInit {
  private readonly logger = new Logger(SearchConsumer.name);

  constructor(
    @Inject(MESSAGING_SERVICE)
    private readonly messagingService: MessagingService,
    @Inject(MEILISEARCH_SERVICE)
    private readonly meilisearchService: MeilisearchService,
  ) {}

  async onModuleInit() {
    await this.messagingService.subscribe(
      Queues.SEARCH_INDEX,
      async (message: unknown) => {
        await this.handleSearchIndex(message);
      },
    );

    this.logger.log("Search consumer started");
  }

  private async handleSearchIndex(message: unknown) {
    const event = message as {
      eventType?: string;
      dealId?: string;
      payload?: Record<string, unknown>;
    };

    const eventType = event.eventType ?? "";
    const dealId =
      event.dealId ?? (event.payload?.["id"] as string | undefined);

    this.logger.debug(`Search index event: ${eventType}, dealId: ${dealId}`);

    try {
      switch (eventType) {
        case "DEAL_APPROVED":
        case "deal.approved":
          await this.indexDeal(event.payload ?? {});
          break;

        case "DEAL_REJECTED":
        case "deal.rejected":
          if (dealId) {
            await this.removeDeal(dealId);
          }
          break;

        case "DEAL_EXPIRED":
        case "deal.expired":
          if (dealId) {
            await this.removeDeal(dealId);
          }
          break;

        case "DEAL_SUBMITTED":
        case "deal.submitted":
          this.logger.debug(
            "DealSubmitted event received — no indexing action for pending deal",
          );
          break;

        default:
          this.logger.warn(`Unknown search event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle search index event ${eventType}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  private async indexDeal(payload: Record<string, unknown>) {
    const document: DealDocument = {
      id: payload["id"] as string,
      title: payload["title"] as string,
      description: (payload["description"] as string) ?? "",
      slug: (payload["slug"] as string) ?? "",
      platform: payload["platform"] as string,
      categoryId: (payload["categoryId"] as string) ?? "",
      categoryName: (payload["categoryName"] as string) ?? "",
      salePrice: payload["salePrice"] as number,
      originalPrice: payload["originalPrice"] as number,
      discountPercent: payload["discountPercent"] as number,
      imageUrl: (payload["imageUrl"] as string) ?? "",
      sourceUrl: (payload["dealUrl"] as string) ?? "",
      score: (payload["score"] as number) ?? 0,
      viewCount: (payload["viewCount"] as number) ?? 0,
      upvoteCount:
        (payload["upvoteCount"] as number) ??
        (payload["upvotes"] as number) ??
        0,
      status: payload["status"] as string,
      expiredAt: (payload["expiredAt"] as string | undefined) ?? null,
      createdAt: payload["createdAt"] as string,
    };

    await this.meilisearchService.indexDeal(document);
    this.logger.log(`Indexed deal: ${document.id} (${document.title})`);
  }

  private async removeDeal(dealId: string) {
    await this.meilisearchService.removeDeal(dealId);
    this.logger.log(`Removed deal from index: ${dealId}`);
  }
}
