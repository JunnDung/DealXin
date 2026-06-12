import { Injectable } from "@nestjs/common";
import { type Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import {
  type CreateDealData,
  type DealFilterParams,
  type DealRepository,
  type UpdateDealData,
} from "./deal.repository";

const SELECT_DEAL_FIELDS = {
  id: true,
  title: true,
  slug: true,
  description: true,
  platform: true,
  sourceUrl: true,
  imageUrl: true,
  originalPrice: true,
  salePrice: true,
  discountPercent: true,
  currency: true,
  status: true,
  score: true,
  viewCount: true,
  clickCount: true,
  expiredAt: true,
  createdAt: true,
  updatedAt: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true } },
  sourceId: true,
  source: { select: { id: true, name: true, slug: true, platform: true } },
  createdById: true,
  createdBy: { select: { id: true, name: true } },
  approvedById: true,
  approvedBy: { select: { id: true, name: true } },
} as const;

@Injectable()
export class PrismaDealRepository implements DealRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDealData) {
    return this.prisma.deal.create({
      data: {
        ...data,
        status: "PENDING",
        score: 0,
      },
      select: SELECT_DEAL_FIELDS,
    });
  }

  async findById(id: string) {
    return this.prisma.deal.findUnique({
      where: { id },
      select: SELECT_DEAL_FIELDS,
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.deal.findUnique({
      where: { slug },
      select: SELECT_DEAL_FIELDS,
    });
  }

  async findMany(parameters: DealFilterParams) {
    const where: Prisma.DealWhereInput = {
      deletedAt: null,
    };

    if (parameters.platform) {
      where.platform = parameters.platform as
        | "SHOPEE"
        | "LAZADA"
        | "TIKTOK_SHOP"
        | "OTHER";
    }
    if (parameters.categoryId) {
      where.categoryId = parameters.categoryId;
    }
    if (parameters.status) {
      where.status = parameters.status as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED";
    }
    if (parameters.minDiscount !== undefined) {
      where.discountPercent = {
        ...((where.discountPercent as object) ?? {}),
        gte: parameters.minDiscount,
      };
    }
    if (parameters.maxDiscount !== undefined) {
      where.discountPercent = {
        ...((where.discountPercent as object) ?? {}),
        lte: parameters.maxDiscount,
      };
    }
    if (parameters.minPrice !== undefined) {
      where.salePrice = {
        ...((where.salePrice as object) ?? {}),
        gte: parameters.minPrice,
      };
    }
    if (parameters.maxPrice !== undefined) {
      where.salePrice = {
        ...((where.salePrice as object) ?? {}),
        lte: parameters.maxPrice,
      };
    }

    let orderBy: Prisma.DealOrderByWithRelationInput = { createdAt: "desc" };
    switch (parameters.sortBy) {
      case "discount":
        orderBy = { discountPercent: "desc" };
        break;
      case "hot":
        orderBy = { score: "desc" };
        break;
      case "expiring":
        orderBy = { expiredAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const page = Math.max(1, parameters.page ?? 1);
    const limit = Math.min(100, Math.max(1, parameters.limit ?? 20));
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.deal.findMany({
        where,
        select: SELECT_DEAL_FIELDS,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateDealData) {
    return this.prisma.deal.update({
      where: { id },
      data,
      select: SELECT_DEAL_FIELDS,
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.deal.update({
      where: { id },
      data: { status: status as never },
      select: SELECT_DEAL_FIELDS,
    });
  }

  async incrementViewCount(id: string) {
    await this.prisma.deal.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async delete(id: string) {
    await this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where: Prisma.DealWhereInput) {
    return this.prisma.deal.count({ where: { ...where, deletedAt: null } });
  }
}
