import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

export enum SortBy {
  NEWEST = "newest",
  DISCOUNT = "discount",
  HOT = "hot",
  EXPIRING = "expiring",
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class DealFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ["SHOPEE", "LAZADA", "TIKTOK_SHOP", "OTHER"] })
  @IsEnum(["SHOPEE", "LAZADA", "TIKTOK_SHOP", "OTHER"])
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ["PENDING", "APPROVED", "REJECTED", "EXPIRED"] })
  @IsEnum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  minDiscount?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: SortBy, default: SortBy.NEWEST })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy = SortBy.NEWEST;
}
