import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { IngestionController } from "./ingestion.controller";
import { IngestionService } from "./ingestion.service";
import { AuditLogService } from "../common/audit-log.service";

import { AdapterFactory } from "./adapters/adapter.factory";
import { MockShopeeAdapter } from "./adapters/mock-shopee.adapter";
import { MockLazadaAdapter } from "./adapters/mock-lazada.adapter";
import { MockTiktokShopAdapter } from "./adapters/mock-tiktok-shop.adapter";
import { CsvImportAdapter } from "./adapters/csv-import.adapter";
import { JsonImportAdapter } from "./adapters/json-import.adapter";

@Module({
  imports: [MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } })],
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
