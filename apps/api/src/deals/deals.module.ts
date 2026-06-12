import { Module } from "@nestjs/common";

import { AuditLogService } from "../common/audit-log.service";
import { OutboxService } from "../common/outbox.service";
import { DealsController } from "./deals.controller";
import { DealsService } from "./deals.service";
import { PrismaDealRepository } from "./repositories/prisma-deal.repository";
import { DealStatusTransitionStrategy } from "./strategies";
import { DEAL_REPOSITORY, DEAL_STATUS_STRATEGY } from "./deals.tokens";

@Module({
  controllers: [DealsController],
  providers: [
    DealsService,
    { provide: DEAL_REPOSITORY, useClass: PrismaDealRepository },
    { provide: DEAL_STATUS_STRATEGY, useClass: DealStatusTransitionStrategy },
    AuditLogService,
    OutboxService,
  ],
  exports: [DealsService],
})
export class DealsModule {}
