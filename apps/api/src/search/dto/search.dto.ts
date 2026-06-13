import { ApiPropertyOptional } from "@nestjs/swagger";

export class SearchDealsQueryDto {
  @ApiPropertyOptional({ description: "Search query" })
  q?: string;

  @ApiPropertyOptional({ description: "Filter by platform" })
  platform?: string;

  @ApiPropertyOptional({ description: "Filter by category" })
  categoryId?: string;

  @ApiPropertyOptional({ description: "Minimum discount percent" })
  minDiscount?: number;

  @ApiPropertyOptional({ description: "Maximum discount percent" })
  maxDiscount?: number;

  @ApiPropertyOptional({
    description: "Sort: newest, discount, hot, price_asc, price_desc",
  })
  sortBy?: string;

  @ApiPropertyOptional({ description: "Page number" })
  page?: number;

  @ApiPropertyOptional({ description: "Items per page" })
  limit?: number;
}
