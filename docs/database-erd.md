# DealXin — Database Schema

> Last updated: 2026-06-11
> ORM: Prisma 6 with PostgreSQL 17
> Status: Phase 2 — Implemented

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌────────────────────┐
│       User       │       │    RefreshToken     │
├─────────────────┤       ├────────────────────┤
│ id (PK, UUID)   │──┐    │ id (PK, UUID)      │
│ email (UNIQUE)  │  │    │ token (UNIQUE)     │──┐
│ name            │  │    │ userId (FK)        │──┤
│ password (hash) │  └───►│ expiresAt          │  │
│ role            │       │ revokedAt          │  │
│ deletedAt (soft│       └────────────────────┘  │
│ createdAt       │                              │
│ updatedAt       │       ┌────────────────────┐  │
└─────────────────┘       │   DealCategory      │  │
         │                ├────────────────────┤  │
         │                │ id (PK, UUID)      │  │
         │                │ name (UNIQUE)      │  │
         ▼                │ slug (UNIQUE)      │◄─┤
┌─────────────────┐       └────────────────────┘  │
│       Deal       │                              │
├─────────────────┤       ┌────────────────────┐  │
│ id (PK, UUID)   │       │    DealSource       │  │
│ title           │       ├────────────────────┤  │
│ slug (UNIQUE)   │       │ id (PK, UUID)      │  │
│ description     │       │ name (UNIQUE)      │  │
│ platform        │       │ platform           │◄─┤
│ sourceUrl       │       │ isActive           │  │
│ imageUrl       │       └────────────────────┘  │
│ originalPrice   │                              │
│ salePrice       │───► DealVote ──► User       │
│ discountPercent │───► DealBookmark ──► User    │
│ status         │───► PriceHistory ──► User    │
│ score          │                              │
│ viewCount      │       ┌────────────────────┐  │
│ clickCount     │       │   OutboxEvent      │  │
│ categoryId (FK) │───►  ├────────────────────┤  │
│ sourceId (FK)   │       │ id (PK, UUID)      │  │
│ createdById(FK) │───►  │ aggregateType      │  │
│ approvedById(FK)│───►  │ aggregateId        │  │
│ expiredAt       │       │ eventType          │  │
│ createdAt       │       │ payload (JSON)     │  │
│ updatedAt       │       │ published          │  │
└─────────────────┘       │ publishedAt        │  │
                         │ createdAt          │  │
┌─────────────────┐       └────────────────────┘  │
│    Voucher       │                              │
├─────────────────┤       ┌────────────────────┐  │
│ id (PK, UUID)   │       │  CrawlerJob       │  │
│ code (UNIQUE)   │       ├────────────────────┤  │
│ discount        │       │ id (PK, UUID)      │  │
│ discountType    │       │ sourceId (FK)      │◄─┤
│ minOrderValue   │       │ status             │  │
│ maxDiscount     │       │ itemsFound         │  │
│ platform        │       │ itemsImported      │  │
│ expiredAt       │       │ errorMessage       │  │
│ isActive       │       └────────────────────┘  │
└─────────────────┘                              │
                         ┌────────────────────┐  │
┌─────────────────┐       │   Notification     │  │
│   AuditLog      │       ├────────────────────┤  │
├─────────────────┤       │ id (PK, UUID)      │  │
│ id (PK, UUID)   │       │ userId (FK)       │──┤
│ userId (FK)     │──┐    │ type              │  │
│ action          │  │    │ title            │  │
│ entityType      │  │    │ body             │  │
│ entityId        │  │    │ isRead           │  │
│ metadata (JSON)  │  │    │ dealId           │  │
│ ipAddress       │  │    │ readAt           │  │
│ userAgent       │  │    │ createdAt        │  │
│ createdAt       │  │    └────────────────────┘  │
└─────────────────┘  │                            │
                     ▼                            │
               ┌─────────────────┐                │
               │    User         │                │
               └─────────────────┘                │
                                            ┌─────▼──────────────┐
                                            │ SearchIndexJob     │
                                            ├───────────────────┤
                                            │ id (PK, UUID)     │
                                            │ entityType        │
                                            │ entityId          │
                                            │ action            │
                                            │ status            │
                                            │ attempts          │
                                            └───────────────────┘
```

---

## Models

### User
| Field | Type | Constraints | Index | Notes |
|---|---|---|---|---|
| id | UUID | PK, @default(uuid()) | yes | |
| email | String | UNIQUE, NOT NULL | yes | |
| name | String | NOT NULL | | |
| password | String | NOT NULL | | bcrypt hashed |
| role | Enum | DEFAULT USER | yes | USER, ADMIN |
| createdAt | DateTime | @default(now()) | | |
| updatedAt | DateTime | @updatedAt | | |
| deletedAt | DateTime? | | | Soft delete |

**Relations**: RefreshToken[], Deal[], DealBookmark[], DealVote[], Notification[], AuditLog[], PriceHistory[]

### RefreshToken
| Field | Type | Constraints | Index | Notes |
|---|---|---|---|---|
| id | UUID | PK, @default(uuid()) | | |
| token | String | UNIQUE | yes | |
| userId | UUID | FK(User) | yes | ON DELETE CASCADE |
| expiresAt | DateTime | NOT NULL | yes | |
| createdAt | DateTime | @default(now()) | | |
| revokedAt | DateTime? | | | Set on logout |

**Notes**: Token rotation on refresh. All tokens revoked on logout.

### Deal
| Field | Type | Constraints | Index | Notes |
|---|---|---|---|---|
| id | UUID | PK, @default(uuid()) | | |
| title | String | NOT NULL | | |
| slug | String | UNIQUE | yes | |
| description | String? | | | |
| platform | Enum | NOT NULL | yes | SHOPEE, LAZADA, TIKTOK_SHOP, OTHER |
| sourceUrl | String? | | | |
| imageUrl | String? | | | |
| originalPrice | Float | NOT NULL | | VND |
| salePrice | Float | NOT NULL | | VND |
| discountPercent | Int | NOT NULL | | 0-100 |
| status | Enum | DEFAULT PENDING | yes | PENDING, APPROVED, REJECTED, EXPIRED |
| score | Int | DEFAULT 0 | yes | Hot score 0-100 |
| viewCount | Int | DEFAULT 0 | | |
| clickCount | Int | DEFAULT 0 | | |
| expiredAt | DateTime? | | | |
| categoryId | UUID? | FK(DealCategory) | yes | |
| sourceId | UUID? | FK(DealSource) | | |
| createdById | UUID | FK(User) | yes | |
| approvedById | UUID? | FK(User) | | |
| createdAt | DateTime | @default(now()) | yes | |
| updatedAt | DateTime | @updatedAt | | |
| deletedAt | DateTime? | | | Soft delete |

**Enums**: `DealStatus`, `Platform`

### DealCategory
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK, @default(uuid()) | |
| name | String | UNIQUE | |
| slug | String | UNIQUE | yes |
| description | String? | | |
| iconUrl | String? | | |
| sortOrder | Int | DEFAULT 0 | |

### DealSource
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| name | String | UNIQUE | |
| slug | String | UNIQUE | yes |
| platform | Enum | NOT NULL | yes |
| baseUrl | String? | | |
| isActive | Boolean | DEFAULT true | |

### DealVote
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| dealId | UUID | FK(Deal), ON DELETE CASCADE | yes |
| userId | UUID | FK(User), ON DELETE CASCADE | yes |
| value | Int | NOT NULL | |

**Constraint**: UNIQUE(dealId, userId) — one vote per user per deal

### DealBookmark
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| dealId | UUID | FK(Deal), ON DELETE CASCADE | yes |
| userId | UUID | FK(User), ON DELETE CASCADE | yes |
| createdAt | DateTime | @default(now()) | |

**Constraint**: UNIQUE(dealId, userId)

### PriceHistory
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| dealId | UUID | FK(Deal), ON DELETE CASCADE | yes |
| price | Float | NOT NULL | |
| recordedAt | DateTime | @default(now()) | yes |
| recordedById | UUID? | FK(User) | |

### Voucher
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| code | String | UNIQUE | |
| description | String? | | |
| discount | Float | NOT NULL | |
| discountType | String | DEFAULT "PERCENT" | PERCENT or FIXED |
| minOrderValue | Float? | | |
| maxDiscount | Float? | | |
| platform | Enum | NOT NULL | |
| sourceUrl | String? | | |
| expiredAt | DateTime | NOT NULL | yes |
| isActive | Boolean | DEFAULT true | |

### CrawlerJob
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| sourceId | UUID | FK(DealSource) | yes |
| status | Enum | DEFAULT QUEUED | yes |
| startedAt | DateTime? | | |
| completedAt | DateTime? | | |
| itemsFound | Int | DEFAULT 0 | |
| itemsImported | Int | DEFAULT 0 | |
| errorMessage | String? | | |

**Enums**: `CrawlerJobStatus`

### OutboxEvent
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| aggregateType | String | NOT NULL | |
| aggregateId | String | NOT NULL | yes |
| eventType | String | NOT NULL | |
| payload | String | NOT NULL | JSON stringified |
| published | Boolean | DEFAULT false | yes |
| publishedAt | DateTime? | | |
| createdAt | DateTime | @default(now()) | |

**Notes**: Implements the Outbox pattern for reliable event publishing.

### Notification
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| userId | UUID | FK(User), ON DELETE CASCADE | yes |
| type | Enum | NOT NULL | |
| title | String | NOT NULL | |
| body | String | NOT NULL | |
| isRead | Boolean | DEFAULT false | yes |
| dealId | String? | | yes |
| readAt | DateTime? | | |
| createdAt | DateTime | @default(now()) | |

**Enums**: `NotificationType`

### AuditLog
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| userId | UUID? | FK(User) | yes |
| action | String | NOT NULL | yes |
| entityType | String? | | yes |
| entityId | String? | | |
| metadata | String? | | JSON |
| ipAddress | String? | | |
| userAgent | String? | | |
| createdAt | DateTime | @default(now()) | |

### SearchIndexJob
| Field | Type | Constraints | Index |
|---|---|---|---|
| id | UUID | PK | |
| entityType | String | NOT NULL | yes |
| entityId | String | NOT NULL | |
| action | String | NOT NULL | INDEX or DELETE |
| status | String | DEFAULT "PENDING" | yes |
| attempts | Int | DEFAULT 0 | |
| error | String? | | |
| createdAt | DateTime | @default(now()) | |
| processedAt | DateTime? | | |

---

## Enums

```prisma
enum UserRole { USER, ADMIN }
enum DealStatus { PENDING, APPROVED, REJECTED, EXPIRED }
enum Platform { SHOPEE, LAZADA, TIKTOK_SHOP, OTHER }
enum CrawlerJobStatus { QUEUED, RUNNING, SUCCESS, FAILED }
enum NotificationType { DEAL_APPROVED, DEAL_REJECTED, DEAL_EXPIRING, PRICE_DROPPED, VOUCHER_EXPIRING }
```

---

## Indexes Summary

| Model | Index Fields | Purpose |
|---|---|---|
| User | email, role | Auth lookup, RBAC filter |
| RefreshToken | userId, token, expiresAt | Token validation, cleanup |
| Deal | status, platform, categoryId, slug, expiredAt, score, createdAt | Feed filtering, search |
| DealVote | dealId, userId | Unique constraint, aggregation |
| DealBookmark | dealId, userId | Unique constraint, user bookmarks |
| PriceHistory | dealId, recordedAt | Price chart, history |
| Voucher | expiredAt, platform | Expiry cleanup, platform filter |
| CrawlerJob | sourceId, status, createdAt | Job queue processing |
| OutboxEvent | published, aggregateType+aggregateId, createdAt | Outbox worker polling |
| Notification | userId+isRead, userId+createdAt, dealId | Inbox, real-time fetch |
| AuditLog | userId, action, entityType+entityId, createdAt | Admin audit trail |
| SearchIndexJob | status, entityType+entityId | Search reindex queue |

---

## Seed Data

| Entity | Count | Notes |
|---|---|---|
| Users | 4 | 1 admin, 3 demo users |
| Categories | 7 | Tech, Fashion, Home, Beauty, Sports, Food, Travel |
| Sources | 4 | Shopee, Lazada, TikTok Shop, Manual |
| Deals | 6 | Mix of approved/pending |
| Vouchers | 2 | DEALXIN10, FREESHIP50 |

**Test credentials:**
- Admin: `admin@dealxin.local` / `admin123`
- User: `demo@dealxin.local` / `user1234`
