import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import {
  type AuthenticatedUser,
  CurrentUser,
  Public,
} from "../auth/decorators";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { type DealsService } from "./deals.service";
import {
  type CreateDealDto,
  type DealFilterQueryDto,
  DealResponseDto,
  PaginatedDealsResponseDto,
  type UpdateDealDto,
  type VoteDealDto,
} from "./dto";

@ApiTags("Deals")
@Controller()
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  // ===== PUBLIC =====

  @Public()
  @Get("deals")
  @ApiOperation({ summary: "List approved deals with filters and pagination" })
  @ApiResponse({ status: 200, type: PaginatedDealsResponseDto })
  async listDeals(
    @Query() filters: DealFilterQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PaginatedDealsResponseDto> {
    return this.deals.findDeals(filters, user?.id);
  }

  @Public()
  @Get("deals/slug/:slug")
  @ApiOperation({ summary: "Get deal by slug" })
  @ApiResponse({ status: 200, type: DealResponseDto })
  async getDealBySlug(
    @Param("slug") slug: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DealResponseDto> {
    return this.deals.findDealBySlug(slug, user?.id);
  }

  @Public()
  @Get("deals/:id")
  @ApiOperation({ summary: "Get deal by ID" })
  @ApiResponse({ status: 200, type: DealResponseDto })
  async getDealById(
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DealResponseDto> {
    return this.deals.findDealById(id, user?.id);
  }

  @Public()
  @Get("deals/:id/price-history")
  @ApiOperation({ summary: "Get price history for a deal" })
  @ApiResponse({ status: 200, isArray: true })
  async getPriceHistory(@Param("id") id: string) {
    return this.deals.getPriceHistory(id);
  }

  // ===== USER =====

  @UseGuards(JwtAuthGuard)
  @Post("deals")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submit a new deal for review" })
  @ApiResponse({ status: 201, type: DealResponseDto })
  @ApiResponse({ status: 401, description: "Not authenticated" })
  async createDeal(
    @Body() dto: CreateDealDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealResponseDto> {
    return this.deals.createDeal(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("deals/:id")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update own deal" })
  @ApiResponse({ status: 200, type: DealResponseDto })
  @ApiResponse({ status: 403, description: "Not your deal" })
  @ApiResponse({ status: 404, description: "Deal not found" })
  async updateDeal(
    @Param("id") id: string,
    @Body() dto: UpdateDealDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealResponseDto> {
    return this.deals.updateDeal(id, dto, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post("deals/:id/vote")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upvote (1), downvote (-1), or remove vote (0)" })
  @ApiResponse({ status: 200 })
  async voteDeal(
    @Param("id") id: string,
    @Body() dto: VoteDealDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deals.voteDeal(id, user.id, dto.value);
  }

  @UseGuards(JwtAuthGuard)
  @Post("deals/:id/bookmark")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Toggle bookmark on a deal" })
  @ApiResponse({ status: 200 })
  async toggleBookmark(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deals.bookmarkDeal(id, user.id);
  }

  // ===== ADMIN =====

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("admin/deals/pending")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all pending deals for moderation" })
  @ApiResponse({ status: 200, type: PaginatedDealsResponseDto })
  async listPendingDeals(@Query() filters: DealFilterQueryDto) {
    return this.deals.getPendingDeals(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("admin/deals/:id/approve")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Approve a pending deal" })
  @ApiResponse({ status: 200, type: DealResponseDto })
  @ApiResponse({ status: 400, description: "Invalid transition" })
  async approveDeal(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealResponseDto> {
    return this.deals.approveDeal(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("admin/deals/:id/reject")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reject a pending deal" })
  @ApiResponse({ status: 200, type: DealResponseDto })
  @ApiResponse({ status: 400, description: "Invalid transition" })
  async rejectDeal(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { reason?: string },
  ): Promise<DealResponseDto> {
    return this.deals.rejectDeal(id, user.id, body.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("admin/deals/:id/expire")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark a deal as expired" })
  @ApiResponse({ status: 200, type: DealResponseDto })
  async expireDeal(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DealResponseDto> {
    return this.deals.expireDeal(id, user.id);
  }
}
