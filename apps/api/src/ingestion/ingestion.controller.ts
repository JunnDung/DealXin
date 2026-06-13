import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { type AuthenticatedUser, CurrentUser } from "../auth/decorators";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CrawlerJobDto, ImportResultDto, PaginatedJobsDto } from "./dto";
import { type IngestionService } from "./ingestion.service";

interface MulterFile {
  buffer: Buffer;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

@ApiTags("ingestion")
@Controller("ingestion")
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post("import/json")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("USER", "ADMIN")
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary", description: "JSON file" },
        sourceId: { type: "string" },
      },
    },
  })
  @ApiResponse({ type: ImportResultDto })
  async importJson(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: MulterFile,
    @Body("sourceId") sourceId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: unknown }> {
    const result = await this.ingestionService.importJson(
      file.buffer,
      sourceId,
      user.id,
    );
    return { data: result };
  }

  @Post("import/csv")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("USER", "ADMIN")
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary", description: "CSV file" },
        sourceId: { type: "string" },
      },
    },
  })
  @ApiResponse({ type: ImportResultDto })
  async importCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: MulterFile,
    @Body("sourceId") sourceId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: unknown }> {
    const result = await this.ingestionService.importCsv(
      file.buffer,
      sourceId,
      user.id,
    );
    return { data: result };
  }

  @Post("crawl/:sourceType")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiResponse({ type: ImportResultDto })
  async crawlSource(
    @Param("sourceType") sourceType: string,
    @Query("page") page: number | undefined,
    @Query("limit") limit: number | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: unknown }> {
    const options: { page?: number; limit?: number } = {};
    if (page !== undefined) options.page = page;
    if (limit !== undefined) options.limit = limit;
    const result = await this.ingestionService.crawlSource(
      sourceType as "SHOPEE" | "LAZADA" | "TIKTOK_SHOP",
      user.id,
      options,
    );
    return { data: result };
  }

  @Get("jobs")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiResponse({ type: PaginatedJobsDto })
  async getJobs(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ): Promise<{ data: unknown; meta: unknown }> {
    const result = await this.ingestionService.getJobs(+page, +limit);
    return { data: result.data, meta: result.meta };
  }

  @Get("jobs/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiResponse({ type: CrawlerJobDto })
  async getJob(@Param("id") id: string): Promise<{ data: unknown }> {
    const job = await this.ingestionService.getJob(id);
    return { data: job };
  }
}
