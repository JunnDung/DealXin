import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ImportErrorDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  error!: string;
}

export class ImportResultDto {
  @ApiProperty()
  imported!: number;

  @ApiPropertyOptional()
  skipped?: number;

  @ApiPropertyOptional()
  failed?: number;

  @ApiPropertyOptional({ type: [ImportErrorDto] })
  errors?: ImportErrorDto[];

  @ApiPropertyOptional()
  jobId?: string;
}

export class CrawlerJobDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sourceId!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  itemsFound?: number;

  @ApiPropertyOptional()
  itemsImported?: number;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiProperty()
  createdAt!: Date;
}

export class PaginatedJobsDto {
  @ApiProperty({ type: [CrawlerJobDto] })
  data!: CrawlerJobDto[];

  @ApiProperty()
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
