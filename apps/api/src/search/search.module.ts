import { Module } from "@nestjs/common";

import { MEILISEARCH_SERVICE, SEARCH_SERVICE } from "../common/di-tokens";
import { PrismaModule } from "../prisma/prisma.module";
import { MeilisearchService } from "./meilisearch.service";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [
    MeilisearchService,
    { provide: MEILISEARCH_SERVICE, useExisting: MeilisearchService },
    SearchService,
    { provide: SEARCH_SERVICE, useExisting: SearchService },
  ],
  exports: [SearchService, MeilisearchService, MEILISEARCH_SERVICE, SEARCH_SERVICE],
})
export class SearchModule {}
