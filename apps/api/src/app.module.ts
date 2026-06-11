import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { CommonModule } from "./common/common.module";
import { OutboxModule } from "./common/outbox.module";
import { AppConfigModule } from "./config/config.module";
import { DealsModule } from "./deals/deals.module";
import { HealthController } from "./health/health.controller";
import { MessagingModule } from "./messaging/messaging.module";
import { PrismaModule } from "./prisma/prisma.module";
import { IngestionModule } from "./ingestion/ingestion.module";

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
    OutboxModule,
    MessagingModule,
    DealsModule,
    IngestionModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
