import { Module } from "@nestjs/common";

import { ANALYTICS_SERVICE } from "../common/di-tokens";
import { AnalyticsConsumer } from "./analytics.consumer";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: ANALYTICS_SERVICE, useExisting: AnalyticsService },
    AnalyticsConsumer,
  ],
  exports: [AnalyticsService, ANALYTICS_SERVICE],
})
export class AnalyticsModule {}
