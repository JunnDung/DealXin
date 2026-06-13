import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { CommonModule } from "../common/common.module";
import { AdapterFactory } from "./adapters/adapter.factory";
import {
  CSV_ADAPTER,
  JSON_ADAPTER,
  LAZADA_ADAPTER,
  SHOPEE_ADAPTER,
  TIKTOK_ADAPTER,
} from "./adapters/adapter.types";
import { CsvImportAdapter } from "./adapters/csv-import.adapter";
import { JsonImportAdapter } from "./adapters/json-import.adapter";
import { MockLazadaAdapter } from "./adapters/mock-lazada.adapter";
import { MockShopeeAdapter } from "./adapters/mock-shopee.adapter";
import { MockTiktokShopAdapter } from "./adapters/mock-tiktok-shop.adapter";
import { IngestionController } from "./ingestion.controller";
import { IngestionService } from "./ingestion.service";

@Module({
  imports: [
    CommonModule,
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    // Adapters with tokens
    { provide: SHOPEE_ADAPTER, useClass: MockShopeeAdapter },
    { provide: LAZADA_ADAPTER, useClass: MockLazadaAdapter },
    { provide: TIKTOK_ADAPTER, useClass: MockTiktokShopAdapter },
    { provide: CSV_ADAPTER, useClass: CsvImportAdapter },
    { provide: JSON_ADAPTER, useClass: JsonImportAdapter },
    // Factory
    AdapterFactory,
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
