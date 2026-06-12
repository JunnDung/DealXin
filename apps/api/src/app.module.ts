import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { CommonModule } from "./common/common.module";
import { OutboxModule } from "./common/outbox.module";
import { AppConfigModule } from "./config/config.module";
import { DealsModule } from "./deals/deals.module";
import { HealthModule } from "./health/health.module";
import { IngestionModule } from "./ingestion/ingestion.module";
import { MessagingModule } from "./messaging/messaging.module";
import { NotificationModule } from "./notifications/notification.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SearchModule } from "./search/search.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    AppConfigModule,
    PrismaModule,
    AuthModule,
    CommonModule,
    MessagingModule,
    OutboxModule,
    DealsModule,
    IngestionModule,
    SearchModule,
    NotificationModule,
    AnalyticsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
