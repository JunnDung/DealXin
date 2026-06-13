import { Inject, Injectable } from "@nestjs/common";

import {
  CSV_ADAPTER,
  JSON_ADAPTER,
  LAZADA_ADAPTER,
  SHOPEE_ADAPTER,
  TIKTOK_ADAPTER,
} from "./adapter.types";
import { type CsvImportAdapter } from "./csv-import.adapter";
import { type JsonImportAdapter } from "./json-import.adapter";
import { type MockLazadaAdapter } from "./mock-lazada.adapter";
import { type MockShopeeAdapter } from "./mock-shopee.adapter";
import { type MockTiktokShopAdapter } from "./mock-tiktok-shop.adapter";
import {
  type SourceAdapter,
  type SourceType,
} from "./source-adapter.interface";

@Injectable()
export class AdapterFactory {
  private readonly adapterMap: Map<SourceType, SourceAdapter>;

  constructor(
    @Inject(SHOPEE_ADAPTER) private readonly shopeeAdapter: MockShopeeAdapter,
    @Inject(LAZADA_ADAPTER) private readonly lazadaAdapter: MockLazadaAdapter,
    @Inject(TIKTOK_ADAPTER)
    private readonly tiktokAdapter: MockTiktokShopAdapter,
    @Inject(CSV_ADAPTER) private readonly csvAdapter: CsvImportAdapter,
    @Inject(JSON_ADAPTER) private readonly jsonAdapter: JsonImportAdapter,
  ) {
    this.adapterMap = new Map<SourceType, SourceAdapter>([
      [this.shopeeAdapter.sourceType, this.shopeeAdapter],
      [this.lazadaAdapter.sourceType, this.lazadaAdapter],
      [this.tiktokAdapter.sourceType, this.tiktokAdapter],
      [this.csvAdapter.sourceType, this.csvAdapter],
      [this.jsonAdapter.sourceType, this.jsonAdapter],
    ]);
  }

  getAdapter(sourceType: SourceType): SourceAdapter {
    const adapter = this.adapterMap.get(sourceType);
    if (!adapter) {
      const available = Array.from(this.adapterMap.keys()).join(", ");
      throw new Error(
        `No adapter found for '${sourceType}'. Available: ${available}`,
      );
    }
    return adapter;
  }

  getAllAdapters(): SourceAdapter[] {
    return Array.from(this.adapterMap.values());
  }

  hasAdapter(sourceType: SourceType): boolean {
    return this.adapterMap.has(sourceType);
  }
}
