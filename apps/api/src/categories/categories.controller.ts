import { Controller, Get, Inject } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { CATEGORIES_SERVICE } from "../common/di-tokens";

import { Public } from "../auth/decorators";
import { type CategoriesService } from "./categories.service";
import { CategoryResponseDto } from "./dto/category.dto";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(
    @Inject(CATEGORIES_SERVICE)
    private readonly categoriesService: CategoriesService,
  ) {}

  @Public()
  @Get()
  @ApiResponse({ type: [CategoryResponseDto] })
  async list() {
    const categories = await this.categoriesService.list();
    return { success: true, data: categories };
  }
}
