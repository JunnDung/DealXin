import { Controller, Sse, UseGuards } from "@nestjs/common";
import { Observable, interval, startWith, switchMap } from "rxjs";

import { type AuthenticatedUser, CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotificationService } from "./notification.service";

interface SseMessage {
  type: string;
  count: number;
  timestamp: string;
}

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationSseController {
  constructor(private readonly notificationService: NotificationService) {}

  @Sse("stream")
  stream(@CurrentUser() user: AuthenticatedUser): Observable<MessageEvent> {
    return interval(10000).pipe(
      startWith(0),
      switchMap(async () => {
        const count = await this.notificationService.getUnreadCount(user.id);
        const message: SseMessage = {
          type: "unread_count",
          count,
          timestamp: new Date().toISOString(),
        };
        return new MessageEvent("notification", {
          data: JSON.stringify(message),
        });
      }),
    );
  }
}
