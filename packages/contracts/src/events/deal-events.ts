export type Platform = 'SHOPEE' | 'LAZADA' | 'TIKTOK_SHOP' | 'OTHER';
export type DealStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type NotificationType = 'DEAL_APPROVED' | 'PRICE_DROPPED' | 'DEAL_EXPIRING';
export type CrawlerJobStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type UserRole = 'USER' | 'ADMIN';

export interface BaseEvent {
  eventId: string;
  eventType: string;
  occurredAt: string;
  version: 1;
}

export interface DealEventPayload {
  dealId: string;
  title: string;
  slug: string;
  platform: Platform;
  categoryId: string;
  salePrice: number;
  originalPrice: number;
  discountPercent: number;
  sourceUrl: string;
  createdById: string;
}

export interface DealApprovedEvent extends BaseEvent {
  eventType: 'DealApproved';
  payload: DealEventPayload & { approvedById: string; score: number };
}

export interface DealRejectedEvent extends BaseEvent {
  eventType: 'DealRejected';
  payload: DealEventPayload & { rejectedById: string; reason?: string };
}

export interface DealExpiredEvent extends BaseEvent {
  eventType: 'DealExpired';
  payload: { dealId: string; slug: string; expiredById?: string };
}

export interface DealSubmittedEvent extends BaseEvent {
  eventType: 'DealSubmitted';
  payload: DealEventPayload;
}

export interface DealViewedEvent extends BaseEvent {
  eventType: 'DealViewed';
  payload: { dealId: string; userId?: string };
}

export interface DealBookmarkedEvent extends BaseEvent {
  eventType: 'DealBookmarked';
  payload: { dealId: string; userId: string; action: 'added' | 'removed' };
}

export interface PriceChangedEvent extends BaseEvent {
  eventType: 'PriceChanged';
  payload: {
    dealId: string;
    title: string;
    platform: Platform;
    oldPrice: number;
    newPrice: number;
    discountPercent: number;
  };
}

export interface NotificationRequestedEvent extends BaseEvent {
  eventType: 'NotificationRequested';
  payload: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    dealId?: string;
  };
}

export type DealXinEvent =
  | DealApprovedEvent
  | DealRejectedEvent
  | DealExpiredEvent
  | DealSubmittedEvent
  | DealViewedEvent
  | DealBookmarkedEvent
  | PriceChangedEvent
  | NotificationRequestedEvent;
