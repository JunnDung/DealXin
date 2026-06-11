import { Module } from "@nestjs/common";

import { AuditLogService } from "../common/audit-log.service";
import { OutboxService } from "../common/outbox.service";
import { DealsController } from "./deals.controller";
import { DealsService } from "./deals.service";
import { PrismaDealRepository } from "./repositories/prisma-deal.repository";
import { DealStatusTransitionStrategy } from "./strategies";

@Module({
  controllers: [DealsController],
  providers: [
    DealsService,
    PrismaDealRepository,
    DealStatusTransitionStrategy,
    AuditLogService,
    OutboxService,
  ],
  exports: [DealsService],
})
export class DealsModule {}
