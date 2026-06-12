import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MessagingService } from "../messaging/messaging.service";
import { logger } from "./logger/pino.logger";

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly pollingInterval = 2000; // 2 seconds
  private isRunning = false;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  async onModuleInit() {
    this.isRunning = true;
    this.scheduleNext();
    logger.info("Outbox publisher started");
  }

  async onModuleDestroy() {
    this.isRunning = false;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    logger.info("Outbox publisher stopped");
  }

  private scheduleNext() {
    if (!this.isRunning) return;
    this.timeoutHandle = setTimeout(() => {
      this.publishPending().finally(() => {
        this.scheduleNext();
      });
    }, this.pollingInterval);
  }

  async publishPending(): Promise<number> {
    try {
      // Fetch unpublished events in batches of 50
      const events = await this.prisma.outboxEvent.findMany({
        where: { published: false },
        take: 50,
        orderBy: { createdAt: "asc" },
      });

      if (events.length === 0) return 0;

      let published = 0;
      const idsToMark: string[] = [];

      for (const event of events) {
        try {
          const payload = JSON.parse(event.payload);
          await this.messagingService.publish(
            this.buildRoutingKey(event),
            payload,
          );
          idsToMark.push(event.id);
          published++;
        } catch (err) {
          logger.error(
            `Failed to publish event ${event.id}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      // Mark published in batch
      if (idsToMark.length > 0) {
        await this.prisma.outboxEvent.updateMany({
          where: { id: { in: idsToMark } },
          data: { published: true, publishedAt: new Date() },
        });
      }

      return published;
    } catch (err) {
      logger.error(`Outbox publish error: ${err instanceof Error ? err.message : String(err)}`);
      return 0;
    }
  }

  private buildRoutingKey(event: { aggregateType: string; eventType: string }): string {
    return `${event.aggregateType.toLowerCase()}.${event.eventType.toLowerCase()}`;
  }
}
