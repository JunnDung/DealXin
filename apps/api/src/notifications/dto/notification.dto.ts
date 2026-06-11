import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationType } from "@prisma/client";

export class NotificationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiPropertyOptional()
  isRead!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  readAt?: string;

  @ApiPropertyOptional()
  dealId?: string;
}

export class NotificationListDto {
  @ApiProperty({ type: [NotificationDto] })
  notifications!: NotificationDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  unreadCount!: number;
}

export class UnreadCountDto {
  @ApiProperty()
  unreadCount!: number;
}

export class NotificationQueryDto {
  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  limit?: number = 20;

  @ApiProperty({ required: false, default: false })
  unreadOnly?: boolean = false;
}
