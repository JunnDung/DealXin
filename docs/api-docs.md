# API Documentation — DealXin

> Auto-generated from NestJS Swagger at `/api/docs`. Last updated: Phase 3.

---

## Authentication

Base URL: `http://localhost:3001/api`

All authenticated endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Register

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Nguyen Van A"
}
```

**Responses:**
- `201 Created` — Returns `{ accessToken, refreshToken, expiresIn, user }`
- `409 Conflict` — Email already registered

---

### Login

**POST** `/auth/login`

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:**
- `200 OK` — Returns `{ accessToken, refreshToken, expiresIn, user }`
- `401 Unauthorized` — Invalid credentials

---

### Refresh Token

**POST** `/auth/refresh`

Exchange a valid refresh token for a new access + refresh token pair.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Responses:**
- `200 OK` — Returns new `{ accessToken, refreshToken, expiresIn, user }`
- `401 Unauthorized` — Token expired or revoked

**Notes:**
- Old refresh token is revoked after use (one-time rotation)
- Refresh tokens expire after 7 days
- Access tokens expire after 15 minutes

---

### Logout

**POST** `/auth/logout`

Revoke all refresh tokens for the authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

**Responses:**
- `200 OK` — Returns `{ message: "Logged out successfully" }`
- `401 Unauthorized` — Not authenticated

---

### Get Current User

**GET** `/auth/me`

Get the profile of the currently authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

**Responses:**
- `200 OK` — Returns `{ id, email, name, role, createdAt }`
- `401 Unauthorized` — Not authenticated

---

## Health Check

**GET** `/health`

Public health check endpoint.

**Responses:**
- `200 OK` — Returns `{ status, uptime, timestamp }`

---

## User Roles

| Role | Description |
|------|-------------|
| `USER` | Standard user — can browse, bookmark, vote, submit deals |
| `ADMIN` | Administrator — can approve/reject deals, manage sources, view audit logs |

---

## Deal Endpoints (Phase 3)

**Implemented in Phase 3.**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/deals` | Public | List approved deals (paginated, filterable) |
| GET | `/deals/:id` | Public | Get deal by ID |
| GET | `/deals/slug/:slug` | Public | Get deal by slug |
| POST | `/deals` | USER | Submit a new deal (status: PENDING) |
| PATCH | `/deals/:id` | USER | Update own deal |
| POST | `/deals/:id/vote` | USER | Vote: 1=up, -1=down, 0=remove |
| POST | `/deals/:id/bookmark` | USER | Toggle bookmark |
| GET | `/deals/:id/price-history` | Public | Price history (last 30 records) |
| GET | `/admin/deals/pending` | ADMIN | List pending deals (paginated) |
| POST | `/admin/deals/:id/approve` | ADMIN | Approve deal |
| POST | `/admin/deals/:id/reject` | ADMIN | Reject deal (optional reason) |
| POST | `/admin/deals/:id/expire` | ADMIN | Mark deal expired |

**Filter parameters for `/deals` and `/admin/deals/pending`:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `platform` | enum | — | SHOPEE, LAZADA, TIKTOK_SHOP, OTHER |
| `categoryId` | UUID | — | Filter by category |
| `status` | enum | APPROVED | PENDING, APPROVED, REJECTED, EXPIRED |
| `minDiscount` | integer | — | Min discount % (0-100) |
| `maxDiscount` | integer | — | Max discount % (0-100) |
| `minPrice` | number | — | Min sale price |
| `maxPrice` | number | — | Max sale price |
| `sortBy` | enum | newest | newest, discount, hot, expiring |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |

---

## Notification Endpoints (Phase 8)

*To be implemented in Phase 8.*

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | USER | List user notifications |
| PATCH | `/notifications/:id/read` | USER | Mark notification as read |

---

## Search Endpoints (Phase 7)

*To be implemented in Phase 7.*

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search/deals` | Public | Full-text search with filters |

---

## Standard Response Format

All API responses follow a consistent format:

**Success:**
```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-06-11T12:00:00.000Z",
  "path": "/api/deals"
}
```

---

## Rate Limiting

Not yet implemented (Phase 10).

## Pagination

Standard pagination parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `20` | Items per page (max: 100) |

Response includes `meta` with `page`, `limit`, `total`, `totalPages`.
