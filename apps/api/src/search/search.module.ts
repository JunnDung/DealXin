import { Module } from "@nestjs/common";

import { MeilisearchService } from "./meilisearch.service";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  controllers: [SearchController],
  providers: [SearchService, MeilisearchService],
  exports: [SearchService, MeilisearchService],
})
export class SearchModule {}
