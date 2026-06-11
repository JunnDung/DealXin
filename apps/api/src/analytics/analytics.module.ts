import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsConsumer } from "./analytics.consumer";
import { AnalyticsController } from "./analytics.controller";

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsConsumer],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
