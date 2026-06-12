import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MessagingModule } from "../messaging/messaging.module";
import { OutboxPublisherService } from "./outbox-publisher.service";

@Module({
  imports: [PrismaModule, MessagingModule],
  providers: [OutboxPublisherService],
})
export class OutboxPublishingModule {}
