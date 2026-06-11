import { IsString, IsOptional, IsNumber, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ImportJsonDto {
  @ApiPropertyOptional({ description: "Source ID for categorizing imported deals" })
  @IsOptional()
  @IsString()
  sourceId?: string;
}

export class ImportCsvDto {
  @ApiPropertyOptional({ description: "Source ID for categorizing imported deals" })
  @IsOptional()
  @IsString()
  sourceId?: string;
}

export class CrawlSourceDto {
  @ApiPropertyOptional({ description: "Page number for paginated crawling" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: "Maximum number of deals to crawl" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
