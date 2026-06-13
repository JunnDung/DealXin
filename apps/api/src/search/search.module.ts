import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { MeilisearchService } from "./meilisearch.service";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService, MeilisearchService],
  exports: [SearchService, MeilisearchService],
})
export class SearchModule {}
