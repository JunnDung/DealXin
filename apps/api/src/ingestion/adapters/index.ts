export { MockShopeeAdapter } from './mock-shopee.adapter';
export { MockLazadaAdapter } from './mock-lazada.adapter';
export { MockTiktokShopAdapter } from './mock-tiktok-shop.adapter';
export { CsvImportAdapter } from './csv-import.adapter';
export { JsonImportAdapter } from './json-import.adapter';

export type { SourceAdapter, SourceType, RawDealItem, AdapterParseResult, NormalizedDealInput } from './source-adapter.interface';
export { AdapterFactory } from './adapter.factory';
