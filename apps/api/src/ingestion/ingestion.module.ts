import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { AuditLogService } from "../common/audit-log.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AdapterFactory } from "./adapters/adapter.factory";
import { CsvImportAdapter } from "./adapters/csv-import.adapter";
import { JsonImportAdapter } from "./adapters/json-import.adapter";
import { MockLazadaAdapter } from "./adapters/mock-lazada.adapter";
import { MockShopeeAdapter } from "./adapters/mock-shopee.adapter";
import { MockTiktokShopAdapter } from "./adapters/mock-tiktok-shop.adapter";
import { IngestionController } from "./ingestion.controller";
import { IngestionService } from "./ingestion.service";

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    // Adapters
    MockShopeeAdapter,
    MockLazadaAdapter,
    MockTiktokShopAdapter,
    CsvImportAdapter,
    JsonImportAdapter,
    // Factory (resolves adapters via APP_ADAPTERS)
    AdapterFactory,
    AuditLogService,
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
