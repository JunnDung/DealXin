import { Global, Module } from "@nestjs/common";

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
export class MessagingModule {}
