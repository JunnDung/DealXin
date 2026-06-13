import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { type AuthenticatedUser, CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  NotificationDto,
  NotificationListDto,
  type NotificationQueryDto,
  UnreadCountDto,
} from "./dto/notification.dto";
import { type NotificationService } from "./notification.service";

@ApiTags("Notifications")
@Controller("notifications")
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: false,
  }),
)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "Get paginated list of notifications" })
  @ApiResponse({ status: 200, type: NotificationListDto })
  async getNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotificationQueryDto,
  ): Promise<{ data: NotificationListDto }> {
    return {
      data: await this.notificationService.getNotifications(user.id, query),
    };
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  @ApiResponse({ status: 200, type: UnreadCountDto })
  async getUnreadCount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: UnreadCountDto }> {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { data: { unreadCount: count } };
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiResponse({ status: 200, type: NotificationDto })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<{ data: NotificationDto }> {
    return { data: await this.notificationService.markAsRead(user.id, id) };
  }

  @Patch("read-all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200 })
  async markAllAsRead(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: { updated: number } }> {
    return { data: await this.notificationService.markAllAsRead(user.id) };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a notification" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async deleteNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<void> {
    await this.notificationService.deleteNotification(user.id, id);
  }
}
