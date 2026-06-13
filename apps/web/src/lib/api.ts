const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = "dx_access_token";
const REFRESH_TOKEN_KEY = "dx_refresh_token";

function getStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getAccessToken(): string | null {
  return getStorageItem(ACCESS_TOKEN_KEY);
}

export function setTokens(pair: TokenPair): void {
  setStorageItem(ACCESS_TOKEN_KEY, pair.accessToken);
  setStorageItem(REFRESH_TOKEN_KEY, pair.refreshToken);
}

export function clearTokens(): void {
  removeStorageItem(ACCESS_TOKEN_KEY);
  removeStorageItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStorageItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const json = await res.json();
    if (!json.data?.accessToken) {
      clearTokens();
      return null;
    }

    setStorageItem(ACCESS_TOKEN_KEY, json.data.accessToken);
    return json.data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const makeRequest = async (token?: string | null): Promise<Response> => {
    const reqHeaders = token
      ? { ...headers, Authorization: `Bearer ${token}` }
      : headers;
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: reqHeaders,
    });
  };

  let res = await makeRequest();

  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    }
  }

  if (!res.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      errorData = await res.json();
    } catch {
      // ignore parse error
    }
    const message =
      (errorData.error as string) ||
      (errorData.message as string) ||
      `HTTP ${res.status}`;
    throw new ApiError(res.status, message, errorData);
  }

  const json = (await res.json()) as Record<string, unknown>;

  if (json.success === false) {
    throw new ApiError(
      res.status,
      (json.error as string) || "Request failed",
      json,
    );
  }

  return json.data as T;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiFetch<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: UserResponse;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  register: (body: { email: string; password: string; fullName: string }) =>
    apiFetch<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: UserResponse;
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  refresh: () =>
    apiFetch<{ accessToken: string }>("/api/auth/refresh", {
      method: "POST",
      auth: false,
    }),

  me: () => apiFetch<UserResponse>("/api/auth/me"),

  logout: () => apiFetch<void>("/api/auth/logout", { method: "POST" }),
};

// ─── Deals ───────────────────────────────────────────────────────────────────

export const dealsApi = {
  list: (parameters?: DealsQueryParams) => {
    const qs = parameters
      ? "?" +
        new URLSearchParams(
          queryStringify(parameters as Record<string, unknown>),
        )
      : "";
    return apiFetch<PaginatedResponse<DealResponse>>(`/api/deals${qs}`, {
      auth: false,
    });
  },

  getBySlug: (slug: string) =>
    apiFetch<DealResponse>(`/api/deals/${slug}`, { auth: false }),

  create: (body: CreateDealInput) =>
    apiFetch<DealResponse>("/api/deals", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<CreateDealInput>) =>
    apiFetch<DealResponse>(`/api/deals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/deals/${id}`, { method: "DELETE" }),

  approve: (id: string) =>
    apiFetch<DealResponse>(`/api/deals/${id}/approve`, { method: "POST" }),

  reject: (id: string, reason?: string) =>
    apiFetch<DealResponse>(`/api/deals/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  vote: (id: string, type: "up" | "down") =>
    apiFetch<{ upvotes: number; downvotes: number }>(`/api/deals/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ type }),
    }),

  bookmark: (id: string) =>
    apiFetch<{ message: string }>(`/api/deals/${id}/bookmark`, {
      method: "POST",
    }),

  removeBookmark: (id: string) =>
    apiFetch<{ message: string }>(`/api/deals/${id}/bookmark`, {
      method: "DELETE",
    }),

  myBookmarks: (parameters?: DealsQueryParams) => {
    const qs = parameters
      ? "?" +
        new URLSearchParams(
          queryStringify(parameters as Record<string, unknown>),
        )
      : "";
    return apiFetch<PaginatedResponse<DealResponse>>(
      `/api/deals/me/bookmarks${qs}`,
    );
  },

  myDeals: (parameters?: DealsQueryParams) => {
    const qs = parameters
      ? "?" +
        new URLSearchParams(
          queryStringify(parameters as Record<string, unknown>),
        )
      : "";
    return apiFetch<PaginatedResponse<DealResponse>>(`/api/deals/me${qs}`);
  },

  adminAll: (parameters?: DealsQueryParams & { status?: string }) => {
    const q = parameters
      ? "?" +
        new URLSearchParams(
          queryStringify(parameters as Record<string, unknown>),
        )
      : "";
    return apiFetch<PaginatedResponse<DealResponse>>(
      `/api/deals/admin/all${q}`,
    );
  },
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => apiFetch<CategoryResponse[]>("/api/categories"),
};

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchApi = {
  search: (parameters: SearchQueryParams) => {
    const qs = parameters
      ? "?" +
        new URLSearchParams(
          queryStringify(parameters as Record<string, unknown>),
        )
      : "";
    return apiFetch<PaginatedResponse<DealResponse>>(`/api/search/deals${qs}`, {
      auth: false,
    });
  },
};

export interface SearchDealsParams {
  q?: string;
  platform?: string;
  categoryId?: string;
  minDiscount?: number;
  maxDiscount?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface SearchDealsResponse {
  success: boolean;
  data: {
    hits: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function searchDeals(
  parameters: SearchDealsParams = {},
): Promise<SearchDealsResponse["data"]> {
  const queryParams = new URLSearchParams();
  if (parameters.q) queryParams.set("q", parameters.q);
  if (parameters.platform) queryParams.set("platform", parameters.platform);
  if (parameters.categoryId)
    queryParams.set("categoryId", parameters.categoryId);
  if (parameters.minDiscount !== undefined)
    queryParams.set("minDiscount", String(parameters.minDiscount));
  if (parameters.maxDiscount !== undefined)
    queryParams.set("maxDiscount", String(parameters.maxDiscount));
  if (parameters.sortBy) queryParams.set("sortBy", parameters.sortBy);
  if (parameters.page !== undefined)
    queryParams.set("page", String(parameters.page));
  if (parameters.limit !== undefined)
    queryParams.set("limit", String(parameters.limit));

  return apiFetch<SearchDealsResponse["data"]>(
    `/search/deals?${queryParams.toString()}`,
    { auth: false },
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsOverviewResponse {
  success: boolean;
  data: {
    totals: {
      pageViews: number;
      upvotes: number;
      bookmarks: number;
      total: number;
    };
    topDeals: {
      dealId: string;
      _count: { dealId: number };
    }[];
    dealsByDay: {
      date: string;
      count: number;
    }[];
  };
}

export async function getAnalyticsOverview(
  days: number = 7,
): Promise<AnalyticsOverviewResponse> {
  return apiFetch<AnalyticsOverviewResponse>(
    `/admin/analytics/overview?days=${days}`,
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (parameters?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => {
    const qs = parameters
      ? "?" +
        new URLSearchParams(
          queryStringify(parameters as Record<string, unknown>),
        )
      : "";
    return apiFetch<NotificationsListResponse>(`/notifications${qs}`);
  },

  getUnreadCount: () =>
    apiFetch<{ unreadCount: number }>("/notifications/unread-count"),

  markRead: (id: string) =>
    apiFetch<void>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    apiFetch<void>("/notifications/read-all", { method: "PATCH" }),

  delete: (id: string) =>
    apiFetch<void>(`/notifications/${id}`, { method: "DELETE" }),
};

export interface NotificationsListResponse {
  notifications: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  dealCount?: number;
}

export interface DealResponse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  imageUrl?: string;
  dealUrl: string;
  couponCode?: string;
  platform: "SHOPEE" | "LAZADA" | "TIKTOK_SHOP" | "OTHER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  score: number;
  viewCount: number;
  bookmarkCount: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  startDate?: string;
  endDate?: string;
  expiredAt?: string;
  category?: CategoryResponse;
  source?: { id: string; name: string };
  creator?: { id: string; fullName: string };
  priceHistory?: { price: number; recordedAt: string }[];
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DealsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "discount" | "hot" | "expiring";
  categoryId?: string;
  platform?: string;
  status?: string;
  search?: string;
}

export interface SearchQueryParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "discount" | "hot" | "price_low" | "price_high";
  platform?: string;
  categoryId?: string;
  minDiscount?: number;
  maxDiscount?: number;
}

interface CreateDealInput {
  title: string;
  description?: string;
  originalPrice: number;
  salePrice: number;
  currency?: string;
  imageUrl?: string;
  dealUrl: string;
  couponCode?: string;
  platform: "SHOPEE" | "LAZADA" | "TIKTOK_SHOP" | "OTHER";
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  expiredAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function queryStringify(
  parameters: Record<string, unknown>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = String(value);
    }
  }
  return result;
}
