import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationSseController } from "./notification-sse.controller";

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController, NotificationSseController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
