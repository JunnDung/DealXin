import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { type Deal, DealStatus } from "@prisma/client";

import { type AuditLogService } from "../common/audit-log.service";
import { MESSAGING_SERVICE } from "../common/di-tokens";
import { AUDIT_LOG_SERVICE } from "../common/di-tokens";
import { type OutboxService } from "../common/outbox.service";
import { PaginatedResponse } from "../common/pagination";
import { type MessagingService } from "../messaging/messaging.service";
import { Queues } from "../messaging/routing-keys";
import { PRISMA_SERVICE } from "../prisma/prisma.constants";
import { type PrismaService } from "../prisma/prisma.service";
import { DEAL_REPOSITORY, DEAL_STATUS_STRATEGY } from "./deals.tokens";
import {
  type CreateDealDto,
  type DealFilterQueryDto,
  type DealResponseDto,
  type UpdateDealDto,
} from "./dto";
import {
  type CreateDealData,
  type DealFilterParams,
  type DealRepository,
  type DealStatusTransitionStrategy,
  DefaultDealScoringStrategy,
} from "./strategies";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăắấặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

@Injectable()
export class DealsService {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prisma: PrismaService,
    @Inject(AUDIT_LOG_SERVICE) private readonly auditLog: AuditLogService,
    @Inject(DEAL_REPOSITORY) private readonly repository: DealRepository,
    @Inject(DEAL_STATUS_STRATEGY)
    private readonly statusTransition: DealStatusTransitionStrategy,
    private readonly outbox: OutboxService,
    @Inject(MESSAGING_SERVICE)
    private readonly messagingService: MessagingService,
  ) {}

  async createDeal(
    dto: CreateDealDto,
    userId: string,
  ): Promise<DealResponseDto> {
    const slug = slugify(dto.title) + "-" + Date.now().toString(36);

    const data: CreateDealData = {
      title: dto.title,
      slug,
      platform: dto.platform as "SHOPEE" | "LAZADA" | "TIKTOK_SHOP" | "OTHER",
      originalPrice: dto.originalPrice,
      salePrice: dto.salePrice,
      discountPercent: this.calculateDiscount(dto.originalPrice, dto.salePrice),
      createdById: userId,
    };
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.sourceUrl !== undefined) data.sourceUrl = dto.sourceUrl;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.expiredAt !== undefined) data.expiredAt = new Date(dto.expiredAt);

    const deal = (await this.repository.create(data)) as Deal;

    await this.auditLog.log({
      userId,
      action: "DealSubmitted",
      entityType: "Deal",
      entityId: deal.id,
      metadata: { title: deal.title, platform: deal.platform },
    });

    await this.outbox.emit("Deal", deal.id, Queues.SEARCH_INDEX, {
      eventId: crypto.randomUUID(),
      eventType: "DEAL_SUBMITTED",
      occurredAt: new Date().toISOString(),
      version: 1,
      payload: {
        dealId: deal.id,
        title: deal.title,
        slug: deal.slug,
        platform: deal.platform,
        categoryId: deal.categoryId ?? "",
        salePrice: deal.salePrice,
        originalPrice: deal.originalPrice,
        discountPercent: deal.discountPercent,
        sourceUrl: deal.sourceUrl ?? "",
        createdById: deal.createdById,
      },
    });

    await this.messagingService.publish(Queues.ANALYTICS, {
      eventType: "DEAL_SUBMITTED",
      dealId: deal.id,
      userId,
      metadata: { title: deal.title, platform: deal.platform },
    });

    return this.toResponseDto(deal);
  }

  async findDeals(
    filters: DealFilterQueryDto,
    userId?: string,
  ): Promise<PaginatedResponse<DealResponseDto>> {
    const result = await this.repository.findMany({
      platform: filters.platform ?? undefined,
      categoryId: filters.categoryId ?? undefined,
      status: filters.status ?? "APPROVED",
      minDiscount: filters.minDiscount ?? undefined,
      maxDiscount: filters.maxDiscount ?? undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      sortBy: filters.sortBy ?? undefined,
      page: filters.page ?? undefined,
      limit: filters.limit ?? undefined,
    } as DealFilterParams);

    let data = result.data as Deal[];

    if (userId) {
      const dealIds = data.map((d) => d.id);
      const votes = await this.prisma.dealVote.findMany({
        where: { dealId: { in: dealIds }, userId },
        select: { dealId: true, value: true },
      });
      const bookmarks = await this.prisma.dealBookmark.findMany({
        where: { dealId: { in: dealIds }, userId },
        select: { dealId: true },
      });
      const voteMap = new Map(votes.map((v) => [v.dealId, v.value]));
      const bookmarkSet = new Set(bookmarks.map((b) => b.dealId));

      data = data.map(
        (d) =>
          ({
            ...d,
            isBookmarked: bookmarkSet.has(d.id),
            userVote: voteMap.get(d.id),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any,
      );
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const totalPages = Math.ceil(result.total / limit);

    return new PaginatedResponse(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.map((d) => this.toResponseDto(d as any)),
      {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    );
  }

  async findDealById(id: string, userId?: string): Promise<DealResponseDto> {
    const deal = (await this.repository.findById(id)) as Deal | null;
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    await this.repository.incrementViewCount(id);

    await this.messagingService.publish(Queues.ANALYTICS, {
      eventType: "PAGE_VIEW",
      dealId: deal.id,
      userId,
      metadata: { slug: deal.slug },
    });

    let isBookmarked: boolean | undefined;
    let userVote: number | undefined;
    if (userId) {
      const [vote, bookmark] = await Promise.all([
        this.prisma.dealVote.findUnique({
          where: { dealId_userId: { dealId: id, userId } },
        }),
        this.prisma.dealBookmark.findUnique({
          where: { dealId_userId: { dealId: id, userId } },
        }),
      ]);
      isBookmarked = !!bookmark;
      userVote = vote?.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.toResponseDto({ ...deal, isBookmarked, userVote } as any);
  }

  async findDealBySlug(
    slug: string,
    userId?: string,
  ): Promise<DealResponseDto> {
    const deal = (await this.repository.findBySlug(slug)) as Deal | null;
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    await this.repository.incrementViewCount(deal.id);

    await this.messagingService.publish(Queues.ANALYTICS, {
      eventType: "PAGE_VIEW",
      dealId: deal.id,
      userId,
      metadata: { slug: deal.slug },
    });

    let isBookmarked: boolean | undefined;
    let userVote: number | undefined;
    if (userId) {
      const [vote, bookmark] = await Promise.all([
        this.prisma.dealVote.findUnique({
          where: { dealId_userId: { dealId: deal.id, userId } },
        }),
        this.prisma.dealBookmark.findUnique({
          where: { dealId_userId: { dealId: deal.id, userId } },
        }),
      ]);
      isBookmarked = !!bookmark;
      userVote = vote?.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.toResponseDto({ ...deal, isBookmarked, userVote } as any);
  }

  async updateDeal(
    id: string,
    dto: UpdateDealDto,
    userId: string,
    userRole: string,
  ): Promise<DealResponseDto> {
    const existing = (await this.repository.findById(id)) as Deal | null;
    if (!existing) {
      throw new NotFoundException("Deal not found");
    }

    if (existing.createdById !== userId && userRole !== "ADMIN") {
      throw new ForbiddenException("You can only edit your own deals");
    }

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.originalPrice !== undefined || dto.salePrice !== undefined) {
      const op = dto.originalPrice ?? existing.originalPrice;
      const sp = dto.salePrice ?? existing.salePrice;
      updateData.discountPercent = this.calculateDiscount(op, sp);
    }
    if (dto.expiredAt) {
      updateData.expiredAt = new Date(dto.expiredAt as string);
    }

    const updated = (await this.repository.update(id, updateData)) as Deal;

    await this.auditLog.log({
      userId,
      action: "DealUpdated",
      entityType: "Deal",
      entityId: id,
      metadata: { title: updated.title, changes: Object.keys(dto) },
    });

    return this.toResponseDto(updated);
  }

  async approveDeal(id: string, adminId: string): Promise<DealResponseDto> {
    const existing = (await this.repository.findById(id)) as Deal | null;
    if (!existing) {
      throw new NotFoundException("Deal not found");
    }

    this.statusTransition.validateTransition({
      currentStatus: existing.status,
      targetStatus: DealStatus.APPROVED,
      userRole: "ADMIN",
      dealCreatedById: existing.createdById,
      requestingUserId: adminId,
    });

    const deal = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.deal.update({
        where: { id },
        data: { status: DealStatus.APPROVED, approvedById: adminId },
      });

      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: adminId,
          action: "DealApproved",
          entityType: "Deal",
          entityId: id,
          metadata: JSON.stringify({
            title: updated.title,
            platform: updated.platform,
          }),
        },
      });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(),
          aggregateType: "Deal",
          aggregateId: id,
          eventType: Queues.SEARCH_INDEX,
          payload: JSON.stringify({
            eventId: crypto.randomUUID(),
            eventType: "DEAL_APPROVED",
            occurredAt: new Date().toISOString(),
            payload: {
              dealId: updated.id,
              title: updated.title,
              slug: updated.slug,
              platform: updated.platform,
              categoryId: updated.categoryId ?? "",
              salePrice: updated.salePrice,
              originalPrice: updated.originalPrice,
              discountPercent: updated.discountPercent,
              sourceUrl: updated.sourceUrl ?? "",
              score: updated.score,
            },
          }),
          published: false,
        },
      });

      await tx.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId: updated.createdById,
          type: "DEAL_APPROVED",
          title: "Deal của bạn đã được duyệt!",
          body: `Deal "${updated.title}" đã được duyệt và hiển thị công khai.`,
          dealId: updated.id,
          isRead: false,
        },
      });

      return updated;
    });

    await this.messagingService.publish(Queues.ANALYTICS, {
      eventType: "DEAL_APPROVED",
      dealId: deal.id,
      userId: adminId,
      metadata: { title: deal.title, score: deal.score },
    });

    return this.toResponseDto(deal);
  }

  async rejectDeal(
    id: string,
    adminId: string,
    reason?: string,
  ): Promise<DealResponseDto> {
    const existing = (await this.repository.findById(id)) as Deal | null;
    if (!existing) {
      throw new NotFoundException("Deal not found");
    }

    this.statusTransition.validateTransition({
      currentStatus: existing.status,
      targetStatus: DealStatus.REJECTED,
      userRole: "ADMIN",
      dealCreatedById: existing.createdById,
      requestingUserId: adminId,
    });

    const deal = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.deal.update({
        where: { id },
        data: { status: DealStatus.REJECTED, approvedById: adminId },
      });

      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: adminId,
          action: "DealRejected",
          entityType: "Deal",
          entityId: id,
          metadata: JSON.stringify({ title: updated.title, reason }),
        },
      });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(),
          aggregateType: "Deal",
          aggregateId: id,
          eventType: Queues.SEARCH_INDEX,
          payload: JSON.stringify({
            eventId: crypto.randomUUID(),
            eventType: "DEAL_REJECTED",
            occurredAt: new Date().toISOString(),
            payload: { dealId: updated.id, title: updated.title },
          }),
          published: false,
        },
      });

      await tx.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId: updated.createdById,
          type: "DEAL_REJECTED",
          title: "Deal của bạn bị từ chối",
          body: `Deal "${updated.title}" không được duyệt. Vui lòng kiểm tra lại.`,
          dealId: updated.id,
          isRead: false,
        },
      });

      return updated;
    });

    await this.messagingService.publish(Queues.ANALYTICS, {
      eventType: "DEAL_REJECTED",
      dealId: deal.id,
      userId: adminId,
      metadata: { title: deal.title, reason },
    });

    return this.toResponseDto(deal);
  }

  async expireDeal(id: string, adminId: string): Promise<DealResponseDto> {
    const existing = (await this.repository.findById(id)) as Deal | null;
    if (!existing) {
      throw new NotFoundException("Deal not found");
    }

    this.statusTransition.validateTransition({
      currentStatus: existing.status,
      targetStatus: DealStatus.EXPIRED,
      userRole: "ADMIN",
      dealCreatedById: existing.createdById,
      requestingUserId: adminId,
    });

    const deal = (await this.repository.updateStatus(
      id,
      DealStatus.EXPIRED,
    )) as Deal;

    await this.auditLog.log({
      userId: adminId,
      action: "DealExpired",
      entityType: "Deal",
      entityId: id,
      metadata: { title: deal.title },
    });

    await this.outbox.emit("Deal", id, "DealExpired", {
      eventId: crypto.randomUUID(),
      eventType: "DealExpired",
      occurredAt: new Date().toISOString(),
      version: 1,
      payload: {
        dealId: deal.id,
        slug: deal.slug,
        expiredById: adminId,
      },
    });

    return this.toResponseDto(deal);
  }

  async voteDeal(
    dealId: string,
    userId: string,
    value: number,
  ): Promise<{ vote: number; score: number }> {
    if (value !== 1 && value !== -1 && value !== 0) {
      throw new BadRequestException(
        "Vote value must be 1 (upvote), -1 (downvote), or 0 (remove vote)",
      );
    }

    const deal = await this.repository.findById(dealId);
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    if (value === 0) {
      await this.prisma.dealVote.deleteMany({
        where: { dealId, userId },
      });
    } else {
      await this.prisma.dealVote.upsert({
        where: { dealId_userId: { dealId, userId } },
        create: { dealId, userId, value },
        update: { value },
      });
    }

    const score = await this.recalculateScore(dealId);

    await this.auditLog.log({
      userId,
      action: "DealVoted",
      entityType: "Deal",
      entityId: dealId,
      metadata: { value },
    });

    await this.messagingService.publish(Queues.ANALYTICS, {
      eventType: value === 1 ? "DEAL_UPVOTE" : "DEAL_DOWNVOTE",
      dealId,
      userId,
      metadata: { score },
    });

    return { vote: value, score };
  }

  async bookmarkDeal(
    dealId: string,
    userId: string,
  ): Promise<{ bookmarked: boolean }> {
    const deal = await this.repository.findById(dealId);
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    const existing = await this.prisma.dealBookmark.findUnique({
      where: { dealId_userId: { dealId, userId } },
    });

    if (existing) {
      await this.prisma.dealBookmark.delete({
        where: { dealId_userId: { dealId, userId } },
      });

      await this.auditLog.log({
        userId,
        action: "DealBookmarkRemoved",
        entityType: "Deal",
        entityId: dealId,
      });

      return { bookmarked: false };
    }

    await this.prisma.dealBookmark.create({
      data: { dealId, userId },
    });

    await this.auditLog.log({
      userId,
      action: "DealBookmarked",
      entityType: "Deal",
      entityId: dealId,
    });

    await this.messagingService.publish(Queues.ANALYTICS, {
      eventType: "DEAL_BOOKMARK",
      dealId,
      userId,
      metadata: { title: (deal as Deal).title },
    });

    return { bookmarked: true };
  }

  async getPriceHistory(
    dealId: string,
  ): Promise<{ id: string; price: number; recordedAt: string }[]> {
    const deal = await this.repository.findById(dealId);
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    const history = await this.prisma.priceHistory.findMany({
      where: { dealId },
      orderBy: { recordedAt: "desc" },
      take: 30,
      select: { id: true, price: true, recordedAt: true },
    });

    return history.map((h) => ({
      id: h.id,
      price: h.price,
      recordedAt: h.recordedAt.toISOString(),
    }));
  }

  async recordPrice(dealId: string, userId?: string): Promise<void> {
    const deal = (await this.repository.findById(dealId)) as Deal | null;
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    const priceRecord: {
      dealId: string;
      price: number;
      recordedById?: string;
    } = {
      dealId,
      price: deal.salePrice,
    };
    if (userId) priceRecord.recordedById = userId;
    await this.prisma.priceHistory.create({ data: priceRecord });
  }

  async getPendingDeals(
    filters: DealFilterQueryDto,
  ): Promise<PaginatedResponse<DealResponseDto>> {
    return this.findDeals({ ...filters, status: "PENDING" });
  }

  private async recalculateScore(dealId: string): Promise<number> {
    const votes = await this.prisma.dealVote.groupBy({
      by: ["value"],
      where: { dealId },
      _count: true,
    });

    const upvoteCount = votes.find((v) => v.value === 1)?._count ?? 0;
    const downvoteCount = votes.find((v) => v.value === -1)?._count ?? 0;
    const viewData = await this.prisma.deal.findUnique({
      where: { id: dealId },
      select: {
        viewCount: true,
        clickCount: true,
        salePrice: true,
        originalPrice: true,
        expiredAt: true,
        discountPercent: true,
      },
    });

    if (!viewData) return 0;

    const daysUntilExpiry = viewData.expiredAt
      ? Math.ceil(
          (viewData.expiredAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        )
      : null;

    const strategy = new DefaultDealScoringStrategy();
    const score = strategy.calculateScore({
      discountPercent: viewData.discountPercent,
      viewCount: viewData.viewCount,
      clickCount: viewData.clickCount,
      voteCount: upvoteCount + downvoteCount,
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      originalPrice: viewData.originalPrice,
      salePrice: viewData.salePrice,
      daysUntilExpiry,
      isExpired: daysUntilExpiry !== null && daysUntilExpiry < 0,
    });

    await this.prisma.deal.update({
      where: { id: dealId },
      data: { score: Math.round(score) },
    });

    return Math.round(score);
  }

  private calculateDiscount(original: number, sale: number): number {
    if (original <= 0) return 0;
    return Math.round(((original - sale) / original) * 100);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toResponseDto(deal: any): DealResponseDto {
    const dto: Record<string, unknown> = {
      id: deal.id,
      title: deal.title,
      slug: deal.slug,
      platform: deal.platform,
      originalPrice: deal.originalPrice,
      salePrice: deal.salePrice,
      discountPercent: deal.discountPercent,
      currency: deal.currency,
      status: deal.status,
      score: deal.score,
      viewCount: deal.viewCount,
      clickCount: deal.clickCount,
      createdAt: new Date(deal.createdAt).toISOString(),
      updatedAt: new Date(deal.updatedAt).toISOString(),
      createdBy: {
        id: deal.createdById,
        name: deal.createdBy?.name ?? "Unknown",
      },
    };

    if (deal.description != null) dto.description = deal.description;
    if (deal.sourceUrl != null) dto.sourceUrl = deal.sourceUrl;
    if (deal.imageUrl != null) dto.imageUrl = deal.imageUrl;
    if (deal.expiredAt != null)
      dto.expiredAt = new Date(deal.expiredAt).toISOString();
    if (deal.category != null)
      dto.category = {
        id: deal.category.id,
        name: deal.category.name,
        slug: deal.category.slug,
      };
    if (deal.source != null)
      dto.source = {
        id: deal.source.id,
        name: deal.source.name,
        slug: deal.source.slug,
        platform: deal.source.platform,
      };
    if (deal.approvedBy != null)
      dto.approvedBy = { id: deal.approvedBy.id, name: deal.approvedBy.name };
    if (deal.isBookmarked != null) dto.isBookmarked = deal.isBookmarked;
    if (deal.userVote != null) dto.userVote = deal.userVote;

    return dto as unknown as DealResponseDto;
  }
}
