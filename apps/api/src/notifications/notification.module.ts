import { Module } from "@nestjs/common";

import { NOTIFICATION_SERVICE } from "../common/di-tokens";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationSseController } from "./notification-sse.controller";

@Module({
  controllers: [NotificationController, NotificationSseController],
  providers: [
    NotificationService,
    { provide: NOTIFICATION_SERVICE, useExisting: NotificationService },
  ],
  exports: [NotificationService, NOTIFICATION_SERVICE],
})
export class NotificationModule {}
