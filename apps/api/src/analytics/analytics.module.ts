import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { AnalyticsConsumer } from "./analytics.consumer";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsConsumer],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
