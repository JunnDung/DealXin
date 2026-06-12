export { AdapterFactory } from "./adapter.factory";
export { CsvImportAdapter } from "./csv-import.adapter";
export { JsonImportAdapter } from "./json-import.adapter";
export { MockLazadaAdapter } from "./mock-lazada.adapter";
export { MockShopeeAdapter } from "./mock-shopee.adapter";
export { MockTiktokShopAdapter } from "./mock-tiktok-shop.adapter";
export type {
  AdapterParseResult,
  NormalizedDealInput,
  RawDealItem,
  SourceAdapter,
  SourceType,
} from "./source-adapter.interface";
