import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MessagingService } from "../messaging.service";
import { Queues } from "../routing-keys";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly messagingService: MessagingService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.messagingService.subscribe(
      Queues.NOTIFICATION,
      async (msg: unknown) => {
        await this.handleNotification(msg);
      },
    );
    
    this.logger.log("Notification consumer started");
  }

  private async handleNotification(msg: unknown) {
    const event = msg as Record<string, unknown>;
    const eventType = String(event["eventType"] ?? "");
    const payload = event["payload"] as Record<string, unknown> | undefined;

    if (!payload) {
      this.logger.warn("Notification event missing payload");
      return;
    }

    const userId = payload["userId"] as string | undefined;
    if (!userId) {
      this.logger.warn("Notification event missing userId");
      return;
    }

    if (eventType === "NotificationRequested") {
      await this.createNotification(
        userId,
        String(payload["type"] ?? "DEAL_APPROVED"),
        String(payload["title"] ?? "Thông báo mới"),
        String(payload["body"] ?? ""),
        payload["dealId"] as string | undefined,
      );
    } else if (eventType === "DealApproved") {
      const dealPayload = payload;
      await this.createNotification(
        userId,
        "DEAL_APPROVED",
        "Deal của bạn đã được duyệt!",
        `Deal "${dealPayload["title"]}" đã được duyệt và hiển thị công khai.`,
        dealPayload["dealId"] as string | undefined,
      );
    } else if (eventType === "DealRejected") {
      const dealPayload = payload;
      await this.createNotification(
        userId,
        "DEAL_REJECTED",
        "Deal của bạn bị từ chối",
        `Deal "${dealPayload["title"]}" không được duyệt. Vui lòng kiểm tra lại.`,
        dealPayload["dealId"] as string | undefined,
      );
    }

    this.logger.log(`Notification created for user ${userId}: ${eventType}`);
  }

  private async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    dealId?: string,
  ) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: type as "DEAL_APPROVED" | "DEAL_REJECTED" | "DEAL_EXPIRING" | "PRICE_DROPPED" | "VOUCHER_EXPIRING",
        title,
        body,
        dealId: dealId ?? null,
        isRead: false,
      },
    });
  }
}
