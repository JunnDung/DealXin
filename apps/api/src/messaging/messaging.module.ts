import { Global, Logger, Module, type OnModuleDestroy } from "@nestjs/common";

import { AnalyticsConsumer } from "../analytics/analytics.consumer";
import { AnalyticsModule } from "../analytics/analytics.module";
import { SearchModule } from "../search/search.module";
import { NotificationConsumer } from "./consumers/notification.consumer";
import { SearchConsumer } from "./consumers/search.consumer";
import { MessagingService } from "./messaging.service";

@Global()
@Module({
  imports: [SearchModule, AnalyticsModule],
  providers: [
    MessagingService,
    SearchConsumer,
    NotificationConsumer,
    AnalyticsConsumer,
  ],
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
