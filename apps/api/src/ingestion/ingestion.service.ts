import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { AuditLogService } from "../common/audit-log.service";
import { AdapterFactory } from "./adapters/adapter.factory";
import { CsvImportAdapter } from "./adapters/csv-import.adapter";
import { JsonImportAdapter } from "./adapters/json-import.adapter";
import type { SourceType, RawDealItem } from "./adapters/source-adapter.interface";

export interface ImportError {
  title: string;
  error: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: ImportError[];
  jobId: string;
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly adapterFactory: AdapterFactory,
    private readonly csvAdapter: CsvImportAdapter,
    private readonly jsonAdapter: JsonImportAdapter,
  ) {}

  async importCsv(
    fileBuffer: Buffer,
    sourceId: string | undefined,
    userId: string,
  ): Promise<ImportResult> {
    const parseResult = await this.csvAdapter.parse(fileBuffer);
    return this.processImport(parseResult.items, sourceId, userId, "CSV");
  }

  async importJson(
    fileBuffer: Buffer,
    sourceId: string | undefined,
    userId: string,
  ): Promise<ImportResult> {
    const parseResult = await this.jsonAdapter.parse(fileBuffer);
    return this.processImport(parseResult.items, sourceId, userId, "JSON");
  }

  async crawlSource(
    sourceType: SourceType,
    userId: string,
    options?: { page?: number; limit?: number },
  ): Promise<ImportResult> {
    const adapter = this.adapterFactory.getAdapter(sourceType);
    if (!adapter.fetch) {
      throw new NotFoundException(
        `Source '${sourceType}' does not support crawling.`,
      );
    }

    const fetchResult = await adapter.fetch(options || {});
    return this.processImport(fetchResult.items, undefined, userId, sourceType);
  }

  async getJobs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      this.prisma.crawlerJob.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: { source: { select: { name: true, platform: true } } },
      }),
      this.prisma.crawlerJob.count(),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getJob(id: string) {
    const job = await this.prisma.crawlerJob.findUnique({
      where: { id },
      include: { source: { select: { name: true, platform: true } } },
    });
    if (!job) throw new NotFoundException("CrawlerJob not found");
    return job;
  }

  private async processImport(
    items: RawDealItem[],
    sourceId: string | undefined,
    userId: string,
    sourceType: SourceType,
  ): Promise<ImportResult> {
    const source = sourceId
      ? await this.prisma.dealSource.findUnique({ where: { id: sourceId } })
      : null;

    const job = await this.prisma.crawlerJob.create({
      data: {
        sourceId: sourceId ?? source?.id ?? "unknown",
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const errors: ImportError[] = [];

    for (const item of items) {
      try {
        const result = await this.upsertDeal(item, sourceId, userId);
        if (result.action === "created") imported++;
        else skipped++;
      } catch (err: unknown) {
        failed++;
        const title = item.title ?? "Unknown";
        const msg = err instanceof Error ? err.message : String(err);
        errors.push({ title, error: msg });
      }

      const processed = imported + skipped + failed;
      if (processed > 0 && processed % 50 === 0) {
        await this.prisma.crawlerJob.update({
          where: { id: job.id },
          data: { itemsFound: items.length, itemsImported: imported },
        });
      }
    }

    const allFailed = failed === items.length;
    const firstError = errors[0]?.error;

    await this.prisma.crawlerJob.update({
      where: { id: job.id },
      data: {
        status: allFailed ? "FAILED" : "SUCCESS",
        completedAt: new Date(),
        itemsFound: items.length,
        itemsImported: imported,
        ...(firstError !== undefined ? { errorMessage: firstError } : {}),
      },
    });

    await this.auditLog.log({
      action: "IMPORT_COMPLETED",
      entityType: "CrawlerJob",
      entityId: job.id,
      userId,
      metadata: { sourceType, totalItems: items.length, imported, skipped, failed },
    });

    return { imported, skipped, failed, errors, jobId: job.id };
  }

  private async upsertDeal(
    item: RawDealItem,
    sourceId: string | undefined,
    userId: string,
  ): Promise<{ action: "created" | "skipped" }> {
    const originalPrice = item.originalPrice;
    const salePrice = item.salePrice;
    const discountPercent =
      originalPrice > 0
        ? Math.round((1 - salePrice / originalPrice) * 100)
        : 0;

    const sourceUrl = item.sourceUrl;
    if (sourceUrl) {
      const existing = await this.prisma.deal.findFirst({
        where: { sourceUrl, status: { not: "REJECTED" } },
        select: { id: true },
      });
      if (existing) return { action: "skipped" };
    }

    const slug = this.generateSlug(item.title);

    await this.prisma.deal.create({
      data: {
        title: item.title,
        description: item.description ?? null,
        slug,
        platform: item.platform as "SHOPEE" | "LAZADA" | "TIKTOK_SHOP" | "OTHER",
        sourceUrl: item.sourceUrl ?? null,
        imageUrl: item.imageUrl ?? null,
        originalPrice,
        salePrice,
        discountPercent,
        currency: item.currency ?? "VND",
        externalId: item.externalId ?? null,
        sourceId: sourceId ?? null,
        createdById: userId,
        status: "PENDING",
        score: 0,
        viewCount: 0,
        clickCount: 0,
      },
    });

    return { action: "created" };
  }

  private generateSlug(text: string): string {
    return (
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 100) +
      "-" +
      Date.now().toString(36)
    );
  }
}
