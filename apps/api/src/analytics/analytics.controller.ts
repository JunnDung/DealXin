import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import { ANALYTICS_SERVICE } from "../common/di-tokens";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { type AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@Controller("admin/analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    @Inject(ANALYTICS_SERVICE)
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get("overview")
  @Roles(UserRole.ADMIN)
  async getOverview(@Query("days") days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    const [totals, topDeals, dealsByDay] = await Promise.all([
      this.analyticsService.getTotalEvents(daysNumber),
      this.analyticsService.getTopDealsByViews(daysNumber, 10),
      this.analyticsService.getDealsSubmittedByDay(daysNumber),
    ]);
    return { success: true, data: { totals, topDeals, dealsByDay } };
  }
}
