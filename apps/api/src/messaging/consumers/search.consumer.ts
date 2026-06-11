import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MessagingService } from "../messaging.service";
import { Queues } from "../routing-keys";

@Injectable()
export class SearchConsumer implements OnModuleInit {
  private readonly logger = new Logger(SearchConsumer.name);

  constructor(
    private readonly messagingService: MessagingService,
  ) {}

  async onModuleInit() {
    // NOTE: Meilisearch client not yet set up
    // This consumer logs the intent and processes events
    // Full Meilisearch integration in Phase 7
    
    await this.messagingService.subscribe(
      Queues.SEARCH_INDEX,
      async (msg: unknown) => {
        await this.handleSearchIndex(msg);
      },
    );
    
    this.logger.log("Search consumer started (Meilisearch integration in Phase 7)");
  }

  private async handleSearchIndex(msg: unknown) {
    const event = msg as Record<string, unknown>;
    this.logger.log(`Search indexing event: ${event["eventType"]}`);
    
    // In Phase 7, this will call Meilisearch to index the deal
    // For now, log the deal data that would be indexed
    if (event["payload"]) {
      const payload = event["payload"] as Record<string, unknown>;
      this.logger.debug(`Would index deal: ${payload["title"]} (${payload["dealId"]})`);
    }
  }
}
