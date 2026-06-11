import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationSseController } from "./notification-sse.controller";
import { NotificationService } from "./notification.service";

@Module({
  controllers: [NotificationController, NotificationSseController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
