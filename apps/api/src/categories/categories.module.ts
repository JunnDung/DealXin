import { Module } from "@nestjs/common";

import { CATEGORIES_SERVICE } from "../common/di-tokens";
import { PrismaModule } from "../prisma/prisma.module";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    { provide: CATEGORIES_SERVICE, useExisting: CategoriesService },
  ],
  exports: [CategoriesService, CATEGORIES_SERVICE],
})
export class CategoriesModule {}
