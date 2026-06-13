import { Module } from "@nestjs/common";

import { CommonModule } from "../common/common.module";
import { DealsController } from "./deals.controller";
import { DealsService } from "./deals.service";
import { DEAL_REPOSITORY, DEAL_STATUS_STRATEGY } from "./deals.tokens";
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
    {
      provide: DEAL_STATUS_STRATEGY,
      useClass: DealStatusTransitionStrategy,
    },
  ],
  exports: [DealsService],
})
export class DealsModule {}
