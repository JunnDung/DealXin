import { Global, Module } from "@nestjs/common";

import { AuditLogService } from "./audit-log.service";
import { AUDIT_LOG_SERVICE } from "./di-tokens";

@Global()
@Module({
  providers: [
    AuditLogService,
    { provide: AUDIT_LOG_SERVICE, useExisting: AuditLogService },
  ],
  exports: [AuditLogService, AUDIT_LOG_SERVICE],
})
export class CommonModule {}
