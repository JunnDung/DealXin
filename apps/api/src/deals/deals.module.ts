import { Module } from "@nestjs/common";

import { CommonModule } from "../common/common.module";
import { DealsController } from "./deals.controller";
import { DealsService } from "./deals.service";
import { DEAL_REPOSITORY } from "./deals.tokens";
import { PrismaDealRepository } from "./repositories/prisma-deal.repository";
import { DealStatusTransitionStrategy } from "./strategies";

@Module({
  imports: [CommonModule],
  controllers: [DealsController],
  providers: [
    DealsService,
    {
      provide: DEAL_REPOSITORY,
      useClass: PrismaDealRepository,
    },
    DealStatusTransitionStrategy,
  ],
  exports: [DealsService],
})
export class DealsModule {}
