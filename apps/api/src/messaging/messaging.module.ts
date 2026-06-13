import { Global, Module } from "@nestjs/common";

import { AnalyticsConsumer } from "../analytics/analytics.consumer";
import { AnalyticsModule } from "../analytics/analytics.module";
import { MESSAGING_SERVICE } from "../common/di-tokens";
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
    { provide: MESSAGING_SERVICE, useExisting: MessagingService },
  ],
  exports: [MessagingService, MESSAGING_SERVICE],
})
export class MessagingModule {}
