import { Module } from "@nestjs/common";

import { DEALS_SERVICE } from "../common/di-tokens";
import { CommonModule } from "../common/common.module";
import { OutboxModule } from "../common/outbox.module";
import { MessagingModule } from "../messaging/messaging.module";
import { DealsController } from "./deals.controller";
import { DealsService } from "./deals.service";
import { DEAL_REPOSITORY, DEAL_STATUS_STRATEGY } from "./deals.tokens";
import { PrismaDealRepository } from "./repositories/prisma-deal.repository";
import { DealStatusTransitionStrategy } from "./strategies";

@Module({
  imports: [CommonModule, OutboxModule, MessagingModule],
  controllers: [DealsController],
  providers: [
    DealsService,
    { provide: DEALS_SERVICE, useExisting: DealsService },
    {
      provide: DEAL_REPOSITORY,
      useClass: PrismaDealRepository,
    },
    {
      provide: DEAL_STATUS_STRATEGY,
      useClass: DealStatusTransitionStrategy,
    },
  ],
  exports: [DealsService, DEALS_SERVICE, DEAL_REPOSITORY],
})
export class DealsModule {}
