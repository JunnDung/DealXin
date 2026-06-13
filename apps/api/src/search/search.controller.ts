import { Controller, Get, Inject as InjectCtrl, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { SEARCH_SERVICE } from "../common/di-tokens";

import { Public } from "../auth/decorators";
import { type SearchDealsOptions, type SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(
    @InjectCtrl(SEARCH_SERVICE)
    private readonly searchService: SearchService,
  ) {}

  @Public()
  @Get("deals")
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
    return result;
  }
}
