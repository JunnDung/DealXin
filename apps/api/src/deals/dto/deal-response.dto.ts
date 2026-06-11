import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DealCategoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

export class DealSourceDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() platform!: string;
}

export class DealCreatorDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class DealResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() platform!: string;
  @ApiPropertyOptional() sourceUrl?: string;
  @ApiPropertyOptional() imageUrl?: string;
  @ApiProperty() originalPrice!: number;
  @ApiProperty() salePrice!: number;
  @ApiProperty() discountPercent!: number;
  @ApiProperty() currency!: string;
  @ApiProperty() status!: string;
  @ApiProperty() score!: number;
  @ApiProperty() viewCount!: number;
  @ApiProperty() clickCount!: number;
  @ApiPropertyOptional() expiredAt?: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
  @ApiPropertyOptional() category?: DealCategoryDto;
  @ApiPropertyOptional() source?: DealSourceDto;
  @ApiProperty() createdBy!: DealCreatorDto;
  @ApiPropertyOptional() approvedBy?: DealCreatorDto;
  @ApiPropertyOptional() isBookmarked?: boolean;
  @ApiPropertyOptional() userVote?: number;
}

export class PaginatedDealsResponseDto {
  @ApiProperty({ type: [DealResponseDto] })
  data!: DealResponseDto[];
  @ApiProperty()
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class MessageResponseDto {
  @ApiProperty() message!: string;
}

export class PriceHistoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() price!: number;
  @ApiProperty() recordedAt!: string;
}
