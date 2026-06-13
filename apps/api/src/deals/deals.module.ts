import { Module } from "@nestjs/common";

import { AuditLogService } from "../common/audit-log.service";
import { PrismaModule } from "../prisma/prisma.module";
import { DealsController } from "./deals.controller";
import { DealsService } from "./deals.service";
import { PrismaDealRepository } from "./repositories/prisma-deal.repository";
import { DEAL_REPOSITORY, DealStatusTransitionStrategy } from "./strategies";

@Module({
  imports: [PrismaModule],
  controllers: [DealsController],
  providers: [
    DealsService,
    {
      provide: DEAL_REPOSITORY,
      useClass: PrismaDealRepository,
    },
    DealStatusTransitionStrategy,
    AuditLogService,
  ],
  exports: [DealsService],
})
export class DealsModule {}
