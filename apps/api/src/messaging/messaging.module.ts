import { Module, Global, OnModuleDestroy, Logger } from "@nestjs/common";

import { MessagingService } from "./messaging.service";
import { SearchConsumer } from "./consumers/search.consumer";
import { NotificationConsumer } from "./consumers/notification.consumer";
import { AnalyticsConsumer } from "../analytics/analytics.consumer";
import { SearchModule } from "../search/search.module";

@Global()
@Module({
  imports: [SearchModule],
  providers: [MessagingService, SearchConsumer, NotificationConsumer, AnalyticsConsumer],
  exports: [MessagingService],
})
export class MessagingModule implements OnModuleDestroy {
  private readonly logger = new Logger(MessagingModule.name);

  constructor(private readonly messagingService: MessagingService) {}

  async onModuleDestroy() {
    await this.messagingService.close();
    this.logger.log("RabbitMQ connection closed");
  }
}
