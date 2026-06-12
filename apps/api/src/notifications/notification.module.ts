import { Module } from "@nestjs/common";

import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationSseController } from "./notification-sse.controller";

@Module({
  controllers: [NotificationController, NotificationSseController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
