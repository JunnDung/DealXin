import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@Controller("admin/analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("overview")
  @Roles(UserRole.ADMIN)
  async getOverview(@Query("days") days?: string) {
    const daysNum = days ? parseInt(days, 10) : 7;
    const [totals, topDeals, dealsByDay] = await Promise.all([
      this.analyticsService.getTotalEvents(daysNum),
      this.analyticsService.getTopDealsByViews(daysNum, 10),
      this.analyticsService.getDealsSubmittedByDay(daysNum),
    ]);
    return { success: true, data: { totals, topDeals, dealsByDay } };
  }
}
