import { Inject, Injectable } from "@nestjs/common";

import {
  type CsvImportAdapter,
  type JsonImportAdapter,
  type MockLazadaAdapter,
  type MockShopeeAdapter,
  type MockTiktokShopAdapter,
} from "./adapters/adapter.types";

export * from "./adapters/adapter.types";

@Injectable()
export class AdapterFactory {
  private readonly adapterMap: Map<SourceType, SourceAdapter>;

  constructor(
    @Inject(MockShopeeAdapter) private readonly shopeeAdapter: MockShopeeAdapter,
    @Inject(MockLazadaAdapter) private readonly lazadaAdapter: MockLazadaAdapter,
    @Inject(MockTiktokShopAdapter) private readonly tiktokAdapter: MockTiktokShopAdapter,
    @Inject(CsvImportAdapter) private readonly csvAdapter: CsvImportAdapter,
    @Inject(JsonImportAdapter) private readonly jsonAdapter: JsonImportAdapter,
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
