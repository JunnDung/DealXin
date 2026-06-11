import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class CreateDealDto {
  @ApiProperty({ example: "iPhone 16 Pro 256GB - Giảm 3 triệu chỉ hôm nay" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    example: "iPhone 16 Pro 256GB Natural Titanium. Chip A18 Pro...",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ["SHOPEE", "LAZADA", "TIKTOK_SHOP", "OTHER"] })
  @IsEnum(["SHOPEE", "LAZADA", "TIKTOK_SHOP", "OTHER"])
  platform!: string;

  @ApiPropertyOptional({ example: "https://shopee.vn/iphone-16-pro" })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ example: "https://images.unsplash.com/photo-..." })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 39990000 })
  @IsNumber()
  @Min(0)
  originalPrice!: number;

  @ApiProperty({ example: 34990000 })
  @IsNumber()
  @Min(0)
  salePrice!: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsString()
  @IsOptional()
  expiredAt?: string;
}

export class UpdateDealDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  expiredAt?: string;
}

export class VoteDealDto {
  @ApiProperty({ example: 1, description: "1 = upvote, -1 = downvote" })
  @IsNumber()
  @Min(-1)
  @Max(1)
  value!: number;
}
