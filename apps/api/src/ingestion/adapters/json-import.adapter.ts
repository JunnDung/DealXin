import { Injectable } from "@nestjs/common";

import {
  type AdapterParseResult,
  type NormalizedDealInput,
  type RawDealItem,
  type SourceAdapter,
  type SourceType,
} from "./source-adapter.interface";

@Injectable()
export class JsonImportAdapter implements SourceAdapter {
  readonly sourceType: SourceType = "JSON";
  readonly sourceName = "JSON Import";

  async parse(
    input: Buffer | string,
    _options?: Record<string, unknown>,
  ): Promise<AdapterParseResult> {
    const jsonString =
      typeof input === "string" ? input : input.toString("utf-8");
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;

    // Support { deals: [...] }, { items: [...] }, { data: [...] }, or root [...]
    let rawDeals: unknown[];
    if (Array.isArray(parsed)) {
      rawDeals = parsed;
    } else if (Array.isArray(parsed["deals"])) {
      rawDeals = parsed["deals"] as unknown[];
    } else if (Array.isArray(parsed["items"])) {
      rawDeals = parsed["items"] as unknown[];
    } else if (Array.isArray(parsed["data"])) {
      rawDeals = parsed["data"] as unknown[];
    } else {
      return { items: [] };
    }

    const rawItems: RawDealItem[] = [];
    for (const raw of rawDeals) {
      const deal = raw as Record<string, unknown>;

      const originalPrice = this.parseNumber(
        deal["originalPrice"] || deal["original_price"] || deal["price"],
      );
      const salePrice = this.parseNumber(
        deal["salePrice"] || deal["sale_price"] || deal["saleprice"],
      );
      const title = String(deal["title"] || deal["name"] || "");
      if (!title) continue;
      const item: RawDealItem = {
        title,
        originalPrice,
        salePrice,
        currency: (deal["currency"] as string) || "VND",
        platform: "JSON",
      };
      const extId = deal["externalId"] as string | undefined;
      if (extId) item.externalId = extId;
      const desc = deal["description"] as string | undefined;
      if (desc) item.description = desc;
      const sourceUrl =
        (deal["sourceUrl"] as string) ||
        (deal["url"] as string) ||
        (deal["link"] as string);
      if (sourceUrl) item.sourceUrl = sourceUrl;
      const imgUrl =
        (deal["imageUrl"] as string) ||
        (deal["image_url"] as string) ||
        (deal["image"] as string);
      if (imgUrl) item.imageUrl = imgUrl;
      rawItems.push(item);
    }

    return { items: rawItems, metadata: { totalItems: rawItems.length } };
  }

  normalize(item: RawDealItem): NormalizedDealInput {
    const discountPercent =
      item.originalPrice > 0
        ? Math.round((1 - item.salePrice / item.originalPrice) * 100)
        : 0;

    return {
      title: item.title,
      description: item.description,
      platform: "OTHER",
      sourceUrl: item.sourceUrl,
      imageUrl: item.imageUrl,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      discountPercent,
      currency: item.currency ?? "VND",
      externalId: item.externalId,
      rawData: item.rawData,
    };
  }

  private parseNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}
