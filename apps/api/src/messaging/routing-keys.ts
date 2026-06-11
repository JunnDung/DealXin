export const RoutingKeys = {
  DEAL_APPROVED: "deal.approved",
  DEAL_REJECTED: "deal.rejected",
  DEAL_EXPIRED: "deal.expired",
  DEAL_SUBMITTED: "deal.submitted",
  DEAL_VIEWED: "deal.viewed",
  DEAL_BOOKMARKED: "deal.bookmarked",
  PRICE_CHANGED: "deal.price_changed",
  NOTIFICATION_REQUESTED: "notification.requested",
  ANALYTICS: "analytics.#",
} as const;

export const Exchanges = {
  DEALS: "deals",
  NOTIFICATIONS: "notifications",
  PRICE: "price",
} as const;

export const Queues = {
  SEARCH_INDEX: "search.index",
  NOTIFICATION: "notification.send",
  ANALYTICS: "analytics.process",
} as const;
