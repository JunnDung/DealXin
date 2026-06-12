import { Controller, Get, Query } from "@nestjs/common";
import { SearchService, type SearchDealsOptions } from "./search.service";
import { ApiTags, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get("deals")
  @ApiBearerAuth()
  @ApiResponse({ description: "Full-text search for deals" })
  async searchDeals(
    @Query("q") query?: string,
    @Query("platform") platform?: string,
    @Query("categoryId") categoryId?: string,
    @Query("minDiscount") minDiscount?: string,
    @Query("maxDiscount") maxDiscount?: string,
    @Query("sortBy") sortBy?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const options: SearchDealsOptions = {
      query: query ?? "",
      platform,
      categoryId,
      minDiscount: minDiscount ? parseInt(minDiscount) : undefined,
      maxDiscount: maxDiscount ? parseInt(maxDiscount) : undefined,
      sortBy,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };
    const result = await this.searchService.searchDeals(options);
    return { success: true, data: result };
  }
}
