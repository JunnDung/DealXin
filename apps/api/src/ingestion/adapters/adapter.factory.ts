import { Injectable } from '@nestjs/common';
import {
  SourceType,
  SourceAdapter,
} from './source-adapter.interface';
import { MockShopeeAdapter } from './mock-shopee.adapter';
import { MockLazadaAdapter } from './mock-lazada.adapter';
import { MockTiktokShopAdapter } from './mock-tiktok-shop.adapter';
import { CsvImportAdapter } from './csv-import.adapter';
import { JsonImportAdapter } from './json-import.adapter';

@Injectable()
export class AdapterFactory {
  private readonly adapterMap: Map<SourceType, SourceAdapter>;

  constructor(
    private readonly shopeeAdapter: MockShopeeAdapter,
    private readonly lazadaAdapter: MockLazadaAdapter,
    private readonly tiktokAdapter: MockTiktokShopAdapter,
    private readonly csvAdapter: CsvImportAdapter,
    private readonly jsonAdapter: JsonImportAdapter,
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
      const available = Array.from(this.adapterMap.keys()).join(', ');
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
