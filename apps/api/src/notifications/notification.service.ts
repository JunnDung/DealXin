import { Injectable, NotFoundException } from "@nestjs/common";
import { Notification, NotificationType } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import {
  NotificationDto,
  NotificationQueryDto,
} from "./dto/notification.dto";

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  dealId?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<{
    notifications: NotificationDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      userId: string;
      isRead?: boolean;
    } = { userId };

    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications: notifications.map(this.toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return this.toDto(updated);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { updated: result.count };
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createNotification(data: CreateNotificationData): Promise<NotificationDto> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        dealId: data.dealId ?? null,
        isRead: false,
      },
    });

    return this.toDto(notification);
  }

  private toDto(notification: Notification): NotificationDto {
    const dto: NotificationDto = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };
    if (notification.readAt) {
      dto.readAt = notification.readAt.toISOString();
    }
    if (notification.dealId) {
      dto.dealId = notification.dealId;
    }
    return dto;
  }
}
