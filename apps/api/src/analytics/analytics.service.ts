import { Injectable, Logger } from "@nestjs/common";
import { AnalyticsEventType } from "@prisma/client";

import { type PrismaService } from "../prisma/prisma.service";

interface TrackEventData {
  type: AnalyticsEventType;
  userId: string | undefined;
  dealId: string | undefined;
  metadata: Record<string, unknown> | undefined;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(data: TrackEventData): Promise<void> {
    try {
      const { type, userId, dealId, metadata } = data;
      const createData: Parameters<
        typeof this.prisma.analyticsEvent.create
      >[0]["data"] = {
        type,
        userId: userId ?? null,
        dealId: dealId ?? null,
      };
      if (metadata !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createData.metadata = metadata as any;
      }
      await this.prisma.analyticsEvent.create({ data: createData });
    } catch (error) {
      this.logger.error(
        `Failed to track event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getTopDealsByViews(
    days: number = 7,
    limit: number = 10,
  ): Promise<{ dealId: string; _count: { dealId: number } }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await this.prisma.analyticsEvent.groupBy({
      by: ["dealId"],
      where: {
        type: AnalyticsEventType.PAGE_VIEW,
        dealId: { not: null },
        createdAt: { gte: since },
      },
      _count: { dealId: true },
      orderBy: { _count: { dealId: "desc" } },
      take: limit,
    });

    return result.map((r) => ({
      dealId: r.dealId as string,
      _count: { dealId: r._count.dealId },
    }));
  }

  async getTotalEvents(days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [pageViews, upvotes, bookmarks] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: {
          type: AnalyticsEventType.PAGE_VIEW,
          createdAt: { gte: since },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          type: AnalyticsEventType.DEAL_UPVOTE,
          createdAt: { gte: since },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          type: AnalyticsEventType.DEAL_BOOKMARK,
          createdAt: { gte: since },
        },
      }),
    ]);

    return {
      pageViews,
      upvotes,
      bookmarks,
      total: pageViews + upvotes + bookmarks,
    };
  }

  async getDealsSubmittedByDay(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ["createdAt"],
      where: {
        type: AnalyticsEventType.DEAL_SUBMITTED,
        createdAt: { gte: since },
      },
      _count: { dealId: true },
    });

    const byDay = new Map<string, number>();
    for (const event of events) {
      const dateStr =
        event.createdAt instanceof Date
          ? (event.createdAt.toISOString().split("T")[0] ?? "")
          : (String(event.createdAt).split("T")[0] ?? "");
      const currentCount = byDay.get(dateStr) ?? 0;
      byDay.set(dateStr, currentCount + event._count.dealId);
    }

    return Array.from(byDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
