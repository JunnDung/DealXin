import { Module, Global, OnModuleDestroy, Logger } from "@nestjs/common";

import { MessagingService } from "./messaging.service";
import { SearchConsumer } from "./consumers/search.consumer";
import { NotificationConsumer } from "./consumers/notification.consumer";

@Global()
@Module({
  providers: [MessagingService, SearchConsumer, NotificationConsumer],
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
