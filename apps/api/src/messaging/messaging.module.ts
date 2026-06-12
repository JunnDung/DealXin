import { Module, Global } from "@nestjs/common";

import { MessagingService } from "./messaging.service";
import { SearchConsumer } from "./consumers/search.consumer";
import { NotificationConsumer } from "./consumers/notification.consumer";
import { AnalyticsConsumer } from "../analytics/analytics.consumer";
import { SearchModule } from "../search/search.module";
import { AnalyticsModule } from "../analytics/analytics.module";

@Global()
@Module({
  imports: [SearchModule, AnalyticsModule],
  providers: [MessagingService, SearchConsumer, NotificationConsumer, AnalyticsConsumer],
  exports: [MessagingService],
})
export class MessagingModule {}
