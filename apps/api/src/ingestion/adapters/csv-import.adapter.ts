import { Injectable } from "@nestjs/common";

import {
  type AdapterParseResult,
  type NormalizedDealInput,
  type RawDealItem,
  type SourceAdapter,
  type SourceType,
} from "./source-adapter.interface";

@Injectable()
export class CsvImportAdapter implements SourceAdapter {
  readonly sourceType: SourceType = "CSV";
  readonly sourceName = "CSV Import";

  async parse(
    input: Buffer | string,
    _options?: Record<string, unknown>,
  ): Promise<AdapterParseResult> {
    const csvString =
      typeof input === "string" ? input : input.toString("utf-8");
    const lines = csvString
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      return { items: [] };
    }

    const headerLine = lines[0]!;
    const headers = this.parseCsvLine(headerLine).map((h) =>
      h.trim().toLowerCase(),
    );
    const rawItems: RawDealItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const lineValues = this.parseCsvLine(lines[i]!);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = lineValues[idx] ?? "";
      });

      const title = row["title"];
      if (!title) continue;

      const originalPrice = parseFloat(
        row["originalprice"] || row["original_price"] || "0",
      );
      const salePrice = parseFloat(
        row["saleprice"] || row["sale_price"] || row["price"] || "0",
      );

      const item: RawDealItem = {
        title,
        originalPrice,
        salePrice,
        currency: row["currency"] || "VND",
        platform: "CSV",
      };

      const extId = row["externalid"] || row["external_id"];
      if (extId) item.externalId = extId;

      const desc = row["description"];
      if (desc) item.description = desc;

      const sourceUrl = row["sourceurl"] || row["source_url"] || row["url"];
      if (sourceUrl) item.sourceUrl = sourceUrl;

      const imgUrl = row["imageurl"] || row["image_url"] || row["image"];
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

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i] ?? "";
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}
