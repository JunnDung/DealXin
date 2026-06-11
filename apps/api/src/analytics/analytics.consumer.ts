import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AnalyticsEventType } from "@prisma/client";

import { MessagingService } from "../messaging/messaging.service";
import { Queues } from "../messaging/routing-keys";
import { AnalyticsService } from "./analytics.service";

@Injectable()
export class AnalyticsConsumer implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsConsumer.name);

  constructor(
    private readonly messagingService: MessagingService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.messagingService.subscribe(
      Queues.ANALYTICS,
      async (msg: unknown) => {
        await this.handleAnalyticsEvent(msg);
      },
    );
    this.logger.log("Analytics consumer started");
  }

  private async handleAnalyticsEvent(msg: unknown): Promise<void> {
    const event = msg as {
      eventType: string;
      userId?: string;
      dealId?: string;
      metadata?: Record<string, unknown>;
    };

    const eventType = event.eventType;

    if (!eventType) {
      this.logger.warn("Analytics event missing eventType");
      return;
    }

    try {
      await this.analyticsService.trackEvent({
        type: eventType as AnalyticsEventType,
        userId: event.userId,
        dealId: event.dealId,
        metadata: event.metadata,
      });

      this.logger.debug(`Tracked analytics event: ${eventType}`);
    } catch (error) {
      this.logger.error(
        `Failed to process analytics event: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
