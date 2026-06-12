import { Module } from "@nestjs/common";

import { MessagingModule } from "../messaging/messaging.module";
import { PrismaModule } from "../prisma/prisma.module";
import { OutboxPublisherService } from "./outbox-publisher.service";

@Module({
  imports: [PrismaModule, MessagingModule],
  providers: [OutboxPublisherService],
})
export class OutboxPublishingModule {}
