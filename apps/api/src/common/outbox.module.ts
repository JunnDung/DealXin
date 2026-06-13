import { Module } from "@nestjs/common";

import { OUTBOX_SERVICE } from "./di-tokens";
import { OutboxService } from "./outbox.service";

@Module({
  providers: [
    OutboxService,
    { provide: OUTBOX_SERVICE, useExisting: OutboxService },
  ],
  exports: [OutboxService, OUTBOX_SERVICE],
})
export class OutboxModule {}
