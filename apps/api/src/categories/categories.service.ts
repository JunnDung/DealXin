import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CategoryResponseDto } from "./dto/category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.dealCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { deals: { where: { status: "APPROVED" } } } },
      },
    });

    return categories.map((cat) => {
      const dto: CategoryResponseDto = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        dealCount: cat._count.deals,
      };
      if (cat.description) dto.description = cat.description;
      if (cat.iconUrl) dto.iconUrl = cat.iconUrl;
      return dto;
    });
  }
}
