# Cursor Master Prompt — Xây dựng dự án DealXin Fullstack Microservices

> File này dùng để copy vào Cursor Agent/Composer. Mục tiêu là biến ý tưởng **DealXin** thành một dự án fullstack có thể đưa lên GitHub, deploy demo, ghi vào CV và gây chú ý với nhà tuyển dụng intern IT.

---

## 0. Bối cảnh dự án

Tôi muốn xây dựng một dự án web fullstack nổi bật để ứng tuyển intern IT, định hướng **Fullstack Developer / Backend Developer / Software Developer**.

Tên dự án:

**DealXin — Real-time Deal Aggregator Platform**

Tên repo gợi ý:

```txt
dealxin
```

Brand direction:

```txt
DealXin = web săn deal/voucher/lỗi giá dành cho người dùng Việt Nam, cảm giác nhanh, thông minh, đáng tin, có chất cộng đồng, không quá corporate, không quá trẻ con.
```

Tone UI:

```txt
Nhanh, rõ, có năng lượng săn deal, nhưng vẫn sạch sẽ và chuyên nghiệp để đưa vào portfolio intern IT.
```

Ý tưởng:

Một nền tảng tổng hợp deal, voucher, flash sale, lỗi giá và ưu đãi từ nhiều nguồn thương mại điện tử như Shopee, Lazada, TikTok Shop hoặc nguồn affiliate/public feed/hệ thống nhập tay từ admin. Dự án cần thể hiện được tư duy sản phẩm thật, kiến trúc backend rõ ràng, design pattern, microservices, realtime, search, notification, admin dashboard, CI/CD, testing, deployment và documentation.

Dự án không được là CRUD đơn giản. Hãy làm theo hướng production-style, đủ tốt để tôi đưa vào CV, portfolio và demo với nhà tuyển dụng.

---

## 1. Vai trò của Cursor

Bạn là một senior fullstack architect kiêm tech lead. Hãy đồng hành như một agent thực thi dự án thật.

Bạn phải:

1. Phân tích yêu cầu trước khi code.
2. Chia dự án thành phase nhỏ.
3. Tạo repo structure chuẩn.
4. Tạo code chạy được, không viết placeholder cho có.
5. Viết README, docs, ERD, architecture diagram, API docs.
6. Dùng tối ưu MCP servers hiện có.
7. Dùng tối ưu các skill web/frontend đã cài, đặc biệt là `taste-skill`.
8. Ưu tiên chất lượng code, kiến trúc, khả năng maintain, test và deploy.
9. Sau mỗi phase, tự kiểm tra lỗi, chạy test/lint/build nếu có thể.
10. Không làm tắt, không bỏ qua phần quan trọng bằng câu “implement later”.

---

## 2. MCP servers đang có và cách phải sử dụng

Tôi đang có các MCP servers sau:

- `agentmemory`
- `context7`
- `github`
- `notion`
- `playwright`
- `prisma`
- `supabase`
- `tavily-remote-mcp`
- `vercel`

Hãy dùng chúng tối ưu như sau.

### 2.1. Context7 MCP

Bắt buộc dùng khi cần tra tài liệu chính xác và mới nhất cho:

- Next.js
- React
- NestJS
- Prisma
- PostgreSQL
- Redis
- RabbitMQ
- Supabase
- Vercel
- Tailwind CSS
- shadcn/ui
- TanStack Query
- TanStack Table
- Zod
- Playwright
- OpenTelemetry
- Docker
- GitHub Actions

Quy tắc:

- Trước khi code phần quan trọng, hãy dùng Context7 để lấy docs chính thức.
- Không đoán API nếu có thể tra docs.
- Khi dùng một thư viện mới, hãy kiểm tra cách dùng hiện tại qua Context7.

### 2.2. GitHub MCP

Dùng để:

- Tạo repo nếu cần.
- Quản lý branch.
- Tạo issue/task checklist.
- Tạo commit theo phase.
- Viết README chuẩn.
- Tạo GitHub Actions workflow.
- Nếu có thể, tạo PR theo từng phase.

Quy tắc commit:

- Commit nhỏ, rõ nghĩa.
- Ví dụ:
  - `chore: scaffold monorepo`
  - `feat(auth): add jwt authentication`
  - `feat(deals): add deal moderation workflow`
  - `feat(infra): add docker compose`
  - `test(e2e): add playwright smoke tests`

### 2.3. Playwright MCP

Dùng để:

- Test UI thực tế.
- Kiểm tra flow:
  - landing page load được
  - login/register
  - list deal
  - search/filter deal
  - bookmark deal
  - admin login
  - admin approve/reject deal
  - realtime notification
- Chụp screenshot nếu cần.
- Phát hiện lỗi giao diện, broken layout, button không hoạt động.

Yêu cầu:

- Tạo ít nhất các E2E tests:
  - `auth.spec.ts`
  - `deals.spec.ts`
  - `admin.spec.ts`
  - `search.spec.ts`

### 2.4. Prisma MCP

Dùng để:

- Thiết kế schema.
- Tạo migration.
- Kiểm tra quan hệ bảng.
- Seed data.
- Validate schema.
- Hỗ trợ query type-safe.

Yêu cầu:

- Không để schema lộn xộn.
- Tên bảng/model rõ ràng.
- Có seed data đủ để demo.
- Có migration ban đầu.
- Có docs ERD hoặc mô tả quan hệ bảng.

### 2.5. Supabase MCP

Dùng nếu chọn Supabase làm Postgres cloud/dev database.

Có thể dùng cho:

- Supabase PostgreSQL.
- Auth nếu quyết định dùng Supabase Auth.
- Storage nếu cần lưu image deal.
- Edge function nếu thật sự cần.

Ưu tiên kiến trúc:

- Nếu dùng Supabase, vẫn giữ backend NestJS làm business layer chính.
- Không để frontend gọi thẳng database cho các flow quan trọng.
- Supabase có thể đóng vai trò managed Postgres/Auth/Storage.
- NestJS vẫn quản lý nghiệp vụ, RBAC, event, moderation, notification.

### 2.6. Tavily MCP

Dùng để:

- Research xu hướng UI/UX dashboard deal/coupon.
- Research các pattern sản phẩm tương tự.
- Research best practices hợp pháp về crawler/public feed/affiliate API.
- Research tài liệu hoặc keyword nếu Context7 không phù hợp.

Quy tắc:

- Không dùng Tavily để copy code.
- Chỉ dùng để lấy context, best practice, ý tưởng và tham khảo.

### 2.7. Vercel MCP

Dùng để:

- Deploy frontend Next.js.
- Cấu hình env vars.
- Kiểm tra deployment logs.
- Fix build errors.
- Tối ưu production deployment.

Yêu cầu:

- Deploy được bản demo public.
- README phải có link demo nếu deploy xong.
- Nếu backend không deploy trên Vercel, ghi rõ backend deploy ở đâu hoặc chạy local bằng Docker.

### 2.8. Notion MCP

Dùng nếu có workspace Notion phù hợp.

Có thể dùng để:

- Tạo project roadmap.
- Tạo task board.
- Lưu technical decisions.
- Lưu sprint plan.
- Lưu bug list.

Không bắt buộc nếu không có Notion page sẵn, nhưng nếu dùng được thì hãy tạo project plan rõ ràng.

### 2.9. AgentMemory MCP

Dùng để:

- Lưu quyết định kiến trúc quan trọng.
- Ghi nhớ stack đã chọn.
- Ghi nhớ convention đặt tên.
- Ghi nhớ phase đã hoàn thành.
- Tránh lặp lại quyết định cũ.
- Theo dõi các việc còn dang dở.

Yêu cầu:

- Khi thay đổi quyết định lớn, cập nhật memory.
- Không lưu secret, token, password, API key.

---

## 3. Skill web/frontend phải dùng

Tôi đã cài nhiều skill hỗ trợ làm web, đặc biệt có:

- `https://github.com/Leonxlnx/taste-skill`
- `https://github.com/Nutlope/hallmark`

Hãy tự kiểm tra các skill có trong Cursor và dùng skill phù hợp nhất.

### 3.1. Cách dùng `taste-skill`

Dùng `taste-skill` để tạo direction giao diện có gu, tránh UI mặc định, đặc biệt ở:

- Landing page
- Public deal listing
- Deal detail page
- Portfolio case study page
- Admin dashboard polish
- Empty/loading/error states

### 3.2. Cách dùng `hallmark`

Dùng `hallmark` như một lớp kiểm định UI chống “AI slop” trước khi ship giao diện.

Bắt buộc dùng `hallmark` ở các thời điểm:

1. Trước khi code landing page để xác định visual direction.
2. Sau khi code landing page để audit UI.
3. Sau khi code dashboard để audit layout, hierarchy, spacing, typography.
4. Trước final polish để loại bỏ các dấu hiệu giao diện AI-generated/generic.

Khi dùng `hallmark`, hãy yêu cầu agent kiểm tra:

- Typography có quá generic không.
- Có dùng một font cho mọi thứ quá nhàm chán không.
- Layout có bị center-everything không.
- Hero section có rơi vào mẫu AI phổ biến: hero + 3 cards + CTA không.
- Màu sắc có lạm dụng gradient tím/xanh AI không.
- Spacing có tùy tiện không.
- Motion có hợp lý và có reduced-motion fallback không.
- Copywriting có quá SaaS-neutral/generic không.
- Card, button, badge, table, form có cùng một nhịp nhàm chán không.
- UI có thật sự hợp với sản phẩm săn deal/voucher Việt Nam không.

Quy trình UI bắt buộc:

```txt
taste-skill -> tạo direction và component composition
hallmark -> audit anti-slop
redesign/polish skill nếu có -> chỉnh lại UI
playwright -> kiểm tra flow thật
```

Prompt ngắn để gọi Hallmark trong Cursor:

```txt
Use the Hallmark skill to audit this page for AI-slop. Check typography, layout rhythm, visual hierarchy, color discipline, spacing scale, motion, generic SaaS patterns, fabricated metrics, and whether the page feels intentionally designed for DealXin rather than generated from a template. Give a ranked punch list, then implement the fixes without bulldozing the existing codebase.
```

Bắt buộc:

1. Dùng `taste-skill` hoặc skill frontend tương ứng để tránh UI generic.
2. Trước khi tạo giao diện, phải đưa ra một dòng:
   `Reading this as: ...`
3. Với landing page public, hãy dùng tư duy visual design tốt:
   - Không dùng layout quá generic.
   - Không lạm dụng gradient tím xanh AI.
   - Không dùng 3 card đều nhau nhàm chán nếu không cần.
   - Có typography hierarchy rõ ràng.
   - Có spacing tốt.
   - Có dark mode nếu khả thi.
   - Có responsive mobile.
4. Với dashboard/admin/product UI, ưu tiên clarity hơn hiệu ứng:
   - shadcn/ui
   - TanStack Table
   - form rõ ràng
   - trạng thái loading/error/empty đầy đủ
   - accessibility tốt
5. Dùng skill `full-output-enforcement` hoặc skill tương tự nếu có để tránh code nửa vời.
6. Nếu có skill `redesign-existing-projects`, dùng khi polish lại UI sau khi MVP chạy được.
7. Nếu có skill `minimalist-ui`, `high-end-visual-design`, `brandkit`, `image-to-code`, hãy dùng đúng ngữ cảnh.
8. Không ép dùng skill không phù hợp. Hãy chọn skill theo mục tiêu từng phase.

---

## 4. Tech stack mục tiêu

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- TanStack Table
- Zustand hoặc Jotai nếu cần state global
- Zod
- React Hook Form
- Playwright E2E

### Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis
- RabbitMQ hoặc Kafka
- JWT Auth + Refresh Token
- RBAC
- Swagger/OpenAPI
- Jest hoặc Vitest
- Supertest

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- Vercel cho frontend
- Supabase hoặc managed Postgres cho database
- Optional: Render/Fly.io/Railway/VPS cho backend
- Optional: Nginx nếu cần reverse proxy

### Observability

- OpenTelemetry
- Structured logging
- Metrics cơ bản
- Request ID / Correlation ID
- Health checks

### Search

Chọn một trong hai:

- Meilisearch nếu muốn dễ dùng, nhanh có demo.
- OpenSearch nếu muốn enterprise hơn.

Ưu tiên ban đầu: **Meilisearch** để hoàn thiện nhanh.

---

## 5. Kiến trúc mong muốn

Làm theo chiến lược:

1. Phase đầu: **modular monolith** để chạy nhanh, code rõ.
2. Phase sau: tách dần thành **microservices**.
3. Không chia microservices quá sớm nếu chưa có luồng nghiệp vụ chạy được.
4. Khi tách service, phải có event-driven communication.

Các service mục tiêu:

```txt
api-gateway
auth-service
deal-service
ingestion-service
search-service
notification-service
analytics-service
web
```

Luồng event chính:

```txt
DealSubmitted
DealApproved
DealRejected
DealExpired
DealViewed
DealBookmarked
PriceChanged
NotificationRequested
```

Message broker:

```txt
RabbitMQ
```

Pattern cần có:

- API Gateway Pattern
- BFF Pattern nếu cần cho frontend
- Repository Pattern
- Adapter Pattern
- Factory Pattern
- Strategy Pattern
- Observer/PubSub Pattern
- CQRS cho read/search
- Outbox Pattern
- Saga Pattern nhẹ cho moderation flow
- Circuit Breaker hoặc retry policy cho external source
- Idempotency cho ingestion
- Dependency Injection
- Clean Architecture / Hexagonal Architecture ở mức vừa đủ

---

## 6. Tính năng sản phẩm

### 6.1. User features

- Đăng ký
- Đăng nhập
- Đăng xuất
- Refresh token
- Xem danh sách deal
- Tìm kiếm deal
- Lọc theo:
  - platform
  - category
  - discount range
  - price range
  - status
  - expired time
- Xem chi tiết deal
- Bookmark deal
- Vote hot deal
- Theo dõi giá sản phẩm
- Bật thông báo deal mới

### 6.2. Admin features

- Admin login
- Dashboard tổng quan
- Duyệt deal pending
- Reject deal
- Đánh dấu deal expired
- Quản lý source
- Quản lý crawler job
- Xem audit logs
- Xem analytics:
  - deal views
  - click count
  - hot deals
  - conversion placeholder
  - source performance

### 6.3. Ingestion features

Nguồn dữ liệu nên an toàn và hợp pháp:

- Manual submission
- Mock affiliate feed
- Public feed nếu có
- CSV import
- JSON import
- Adapter giả lập Shopee/Lazada/TikTok Shop để demo kiến trúc

Không được viết code né anti-bot, bypass captcha, scrape trái phép hoặc phá ToS.

### 6.4. Search features

- Full-text search
- Filter theo platform/category/price
- Sort theo:
  - newest
  - discount
  - hot score
  - expiring soon
- Search suggestions nếu kịp

### 6.5. Notification features

- In-app notification
- Email mock hoặc provider thật nếu có
- WebSocket hoặc Server-Sent Events
- Notification khi:
  - deal mới được duyệt
  - deal theo dõi giảm giá
  - voucher sắp hết hạn

### 6.6. AI features vừa đủ

Không làm AI màu mè. Chỉ thêm nếu MVP ổn.

AI có thể gồm:

- Deal summary:
  - “Deal này giảm bao nhiêu?”
  - “Có đáng mua không?”
  - “Điểm cần chú ý là gì?”
- Fake deal detection:
  - So sánh lịch sử giá
  - Nếu giá sale không thấp hơn lịch sử đáng kể thì cảnh báo
- Deal scoring:
  - Điểm 0–100 dựa trên discount, lịch sử giá, độ hot, hạn voucher

Nếu chưa có LLM API key, tạo abstraction interface và mock implementation.

---

## 7. Database schema đề xuất

Tạo Prisma schema với các model tối thiểu:

```txt
User
Role
UserRole
RefreshToken
Deal
DealSource
DealCategory
DealVote
DealBookmark
PriceHistory
Voucher
Notification
CrawlerJob
OutboxEvent
AuditLog
SearchIndexJob
```

Các trường quan trọng của `Deal`:

```txt
id
title
slug
description
platform
sourceUrl
imageUrl
originalPrice
salePrice
discountPercent
currency
status
score
categoryId
sourceId
createdById
approvedById
expiredAt
createdAt
updatedAt
```

Enum:

```txt
DealStatus = PENDING | APPROVED | REJECTED | EXPIRED
Platform = SHOPEE | LAZADA | TIKTOK_SHOP | OTHER
CrawlerJobStatus = QUEUED | RUNNING | SUCCESS | FAILED
NotificationType = DEAL_APPROVED | PRICE_DROPPED | DEAL_EXPIRING
```

Yêu cầu:

- Có index cho các field tìm kiếm/lọc nhiều.
- Có unique constraint cho slug.
- Có audit log cho admin actions.
- Có outbox event để publish event an toàn.

---

## 8. Repo structure mong muốn

Tạo monorepo:

```txt
dealxin/
  apps/
    web/
    api-gateway/
    auth-service/
    deal-service/
    ingestion-service/
    search-service/
    notification-service/
    analytics-service/
  packages/
    shared/
    contracts/
    config/
    eslint-config/
    tsconfig/
  infra/
    docker/
    k8s/
    monitoring/
  docs/
    adr/
    architecture.md
    database-erd.md
    api-docs.md
    event-contracts.md
    deployment.md
    testing.md
  scripts/
  docker-compose.yml
  README.md
  .env.example
```

Nếu microservices ngay từ đầu quá nặng, có thể bắt đầu với:

```txt
apps/
  web/
  api/
packages/
  shared/
  contracts/
```

Sau đó tách service ở phase sau. Nhưng docs phải giải thích rõ quá trình tách.

---

## 9. Yêu cầu chất lượng code

Bắt buộc:

- TypeScript strict mode.
- Không dùng `any` bừa bãi.
- Validate input bằng Zod hoặc class-validator.
- DTO rõ ràng.
- Error handling rõ ràng.
- Không hardcode secret.
- `.env.example` đầy đủ.
- Logging có request ID.
- API response format thống nhất.
- Naming convention nhất quán.
- Không để console.log lung tung trong production code.
- Không để file quá lớn.
- Không để business logic trong controller.
- Không gọi Prisma trực tiếp từ controller.
- Không để frontend gọi API thiếu type.

Backend layering gợi ý:

```txt
controller
application service
domain service
repository interface
repository implementation
prisma datasource
```

Frontend layering gợi ý:

```txt
app routes
features
components
lib/api
lib/auth
stores
types
```

---

## 10. UI/UX yêu cầu

### 10.1. Design direction

Landing page:

```txt
Reading this as: a recruiter-facing technical product demo for an intern fullstack portfolio, with a polished SaaS/product-engineering vibe, leaning toward clean editorial layout, strong data/product visuals, restrained motion, and non-generic Tailwind/shadcn composition.
```

Dashboard:

```txt
Reading this as: a dense product/admin dashboard for deal operations, with a clarity-first B2B tool language, leaning toward shadcn/ui, TanStack Table, strong information hierarchy, accessible forms, and minimal motion.
```

### 10.2. Public pages

- Home
- Deals listing
- Deal detail
- Login
- Register
- About/Architecture showcase page
- Portfolio case study page: giải thích tôi đã build gì

### 10.3. App pages

- User dashboard
- Saved deals
- Price tracking
- Notifications

### 10.4. Admin pages

- Overview
- Pending deals
- Approved deals
- Sources
- Crawler jobs
- Analytics
- Audit logs

### 10.5. UI states

Mỗi page quan trọng phải có:

- loading state
- empty state
- error state
- success toast
- responsive layout
- keyboard accessibility cơ bản

---

## 11. API yêu cầu

Tạo API docs bằng Swagger/OpenAPI.

Endpoint gợi ý:

```txt
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /me

GET /deals
POST /deals
GET /deals/:id
PATCH /deals/:id
POST /deals/:id/vote
POST /deals/:id/bookmark
DELETE /deals/:id/bookmark

GET /admin/deals/pending
POST /admin/deals/:id/approve
POST /admin/deals/:id/reject
POST /admin/deals/:id/expire

GET /search/deals
GET /notifications
PATCH /notifications/:id/read

GET /analytics/overview
GET /analytics/deals/:id

POST /ingestion/import/json
POST /ingestion/import/csv
POST /ingestion/jobs
GET /ingestion/jobs
```

---

## 12. Event contracts

Tạo file:

```txt
docs/event-contracts.md
packages/contracts/src/events
```

Event mẫu:

```ts
export type DealApprovedEvent = {
  eventId: string;
  eventType: "DealApproved";
  occurredAt: string;
  payload: {
    dealId: string;
    title: string;
    platform: "SHOPEE" | "LAZADA" | "TIKTOK_SHOP" | "OTHER";
    salePrice: number;
    discountPercent: number;
  };
};
```

Yêu cầu:

- Event có `eventId`.
- Event có `occurredAt`.
- Event payload có type rõ ràng.
- Consumer phải idempotent.
- Outbox worker publish event từ database sang RabbitMQ.

---

## 13. Testing yêu cầu

### Unit test

- Auth service
- Deal scoring strategy
- Deal status transition
- Price history logic
- Adapter normalize data
- Repository mock tests

### Integration test

- Auth endpoints
- Deal CRUD
- Admin approve/reject
- Outbox event creation
- Search indexing flow

### E2E test Playwright

- User register/login
- Browse deals
- Search/filter
- Bookmark deal
- Admin approve pending deal
- Notification appears

### Load test nếu kịp

- k6 test cho endpoint `/deals`
- Ghi kết quả trong docs

---

## 14. DevOps yêu cầu

Tạo:

```txt
docker-compose.yml
.env.example
.github/workflows/ci.yml
```

Docker Compose gồm:

- postgres
- redis
- rabbitmq
- meilisearch
- backend api/service
- frontend web nếu cần
- optional grafana/prometheus

GitHub Actions gồm:

- install
- lint
- typecheck
- test
- build

Deploy:

- Frontend lên Vercel.
- Backend có thể deploy sau bằng Render/Fly.io/Railway/VPS.
- Nếu chưa deploy backend được, README phải có cách chạy local rõ ràng.

---

## 15. Documentation bắt buộc

Tạo các file:

```txt
README.md
docs/architecture.md
docs/database-erd.md
docs/api-docs.md
docs/event-contracts.md
docs/design-patterns.md
docs/deployment.md
docs/testing.md
docs/roadmap.md
docs/adr/0001-architecture-style.md
docs/adr/0002-database-choice.md
docs/adr/0003-event-broker-choice.md
docs/adr/0004-search-engine-choice.md
```

README phải có:

1. Project overview.
2. Demo screenshots.
3. Tech stack.
4. Architecture diagram.
5. Features.
6. Design patterns used.
7. Database summary.
8. Event-driven flow.
9. How to run.
10. Environment variables.
11. Test commands.
12. Deployment notes.
13. What I learned.
14. Future improvements.
15. CV bullet section.

---

## 16. CV bullet phải tự tạo

Sau khi hoàn thành, hãy tạo mục `docs/cv-bullets.md` với nội dung tiếng Anh như:

```txt
DealXin — Real-time Deal Aggregation Platform

- Built a production-style fullstack platform for aggregating ecommerce deals and vouchers using Next.js, NestJS, PostgreSQL, Redis, RabbitMQ, Prisma, Docker, and OpenTelemetry.
- Designed a microservices-ready architecture with API Gateway, Auth, Deal, Ingestion, Search, Notification, and Analytics modules.
- Applied Clean Architecture, Repository, Adapter, Strategy, CQRS, Outbox, and Pub/Sub patterns to improve maintainability and scalability.
- Implemented admin moderation, full-text search, price tracking, realtime notifications, role-based access control, CI/CD, and E2E testing with Playwright.
- Documented architecture decisions, event contracts, database schema, deployment steps, and testing strategy for recruiter review.
```

---

## 17. Cách làm việc theo phase

Không code tất cả một lần. Hãy làm theo phase.

### Phase 0 — Project audit and planning

Nhiệm vụ:

1. Kiểm tra workspace hiện tại.
2. Kiểm tra package manager nên dùng.
3. Kiểm tra MCP/skills khả dụng.
4. Tạo plan chi tiết.
5. Tạo `docs/roadmap.md`.
6. Tạo `docs/adr/0001-architecture-style.md`.
7. Đề xuất scope MVP.

Output:

- Project plan
- File structure proposal
- Tech decisions
- Task checklist

Không code lớn ở phase này.

---

### Phase 1 — Scaffold monorepo

Nhiệm vụ:

1. Tạo monorepo.
2. Tạo apps web và api.
3. Cấu hình TypeScript strict.
4. Cấu hình ESLint/Prettier.
5. Cấu hình env.
6. Tạo Docker Compose cơ bản.
7. Tạo README bản đầu.

Output:

- App chạy được.
- `pnpm dev` hoặc lệnh tương tự chạy được.
- README có hướng dẫn.

---

### Phase 2 — Database and auth

Nhiệm vụ:

1. Dùng Prisma MCP thiết kế schema.
2. Tạo migration.
3. Tạo seed data.
4. Implement auth:
   - register
   - login
   - refresh token
   - logout
   - me
5. RBAC:
   - USER
   - ADMIN
6. Test auth.

Output:

- Auth chạy được.
- Seed admin user.
- Docs database cập nhật.

---

### Phase 3 — Deals core

Nhiệm vụ:

1. Implement Deal CRUD.
2. Deal status workflow:
   - pending
   - approved
   - rejected
   - expired
3. User submit deal.
4. Admin approve/reject.
5. Vote/bookmark.
6. Price history.
7. Deal scoring strategy.

Pattern phải thể hiện:

- Repository
- Strategy
- State transition validation
- AuditLog

Output:

- API hoạt động.
- Unit/integration tests.
- Swagger docs.

---

### Phase 4 — Frontend MVP

Nhiệm vụ:

1. Dùng taste-skill cho landing page.
2. Dùng shadcn/ui cho dashboard.
3. Tạo pages:
   - Home
   - Deals list
   - Deal detail
   - Login/Register
   - User dashboard
   - Admin dashboard
   - Pending deals
4. Kết nối API.
5. Loading/error/empty states.
6. Responsive.

Output:

- UI đẹp, không generic.
- Flow đăng nhập và duyệt deal chạy được.
- Playwright smoke test.

---

### Phase 5 — Ingestion service and adapters

Nhiệm vụ:

1. Tạo ingestion module/service.
2. Tạo adapter:
   - MockShopeeAdapter
   - MockLazadaAdapter
   - MockTikTokShopAdapter
   - JsonFeedAdapter
   - CsvImportAdapter
3. Normalize data về DealDTO.
4. Idempotency check.
5. CrawlerJob model.
6. Retry logic cơ bản.

Pattern phải thể hiện:

- Adapter
- Factory
- Retry
- Idempotency

Output:

- Import mock data thành deal pending.
- Admin duyệt được.

---

### Phase 6 — Event-driven and microservices-ready

Nhiệm vụ:

1. Thêm RabbitMQ.
2. Thêm OutboxEvent.
3. Khi deal approved, tạo event.
4. Worker publish event.
5. Consumer xử lý:
   - index search
   - create notification
   - update analytics
6. Viết docs event contracts.

Pattern phải thể hiện:

- Outbox
- Pub/Sub
- Observer
- CQRS nhẹ

Output:

- Event flow chạy được.
- Docs rõ ràng.

---

### Phase 7 — Search

Nhiệm vụ:

1. Thêm Meilisearch.
2. Index approved deals.
3. Search endpoint.
4. Filter/sort.
5. Frontend search page.
6. Reindex script.

Output:

- Search nhanh.
- Có empty/error states.
- Có docs.

---

### Phase 8 — Notification and realtime

Nhiệm vụ:

1. In-app notification.
2. Notification list.
3. Mark as read.
4. WebSocket hoặc SSE.
5. Khi deal approved, user thấy notification.
6. Optional: email mock.

Output:

- Realtime demo được.
- E2E test nếu khả thi.

---

### Phase 9 — Analytics and admin polish

Nhiệm vụ:

1. Track DealViewed.
2. Track DealClicked.
3. Hot deal ranking.
4. Admin analytics dashboard.
5. Charts đơn giản.
6. Audit logs UI.

Output:

- Admin dashboard nhìn như sản phẩm thật.
- Có số liệu seed/mock.

---

### Phase 10 — Observability and CI/CD

Nhiệm vụ:

1. Structured logging.
2. Request ID.
3. Health checks.
4. OpenTelemetry setup nếu khả thi.
5. GitHub Actions:
   - lint
   - typecheck
   - test
   - build
6. Docker healthcheck.

Output:

- CI xanh.
- Docs observability.

---

### Phase 11 — Deployment

Nhiệm vụ:

1. Deploy frontend lên Vercel bằng Vercel MCP.
2. Cấu hình env.
3. Fix build errors.
4. Chuẩn bị backend deploy guide.
5. Nếu deploy backend được thì deploy.
6. Cập nhật README demo link.

Output:

- Demo public.
- README có link.
- Deployment docs.

---

### Phase 12 — Final recruiter polish

Nhiệm vụ:

1. Polish UI bằng taste-skill/redesign skill.
2. Chụp screenshot.
3. Update README.
4. Tạo architecture diagram.
5. Tạo `docs/cv-bullets.md`.
6. Tạo `docs/interview-qa.md` gồm các câu hỏi nhà tuyển dụng có thể hỏi:
   - Vì sao dùng microservices?
   - Vì sao dùng Outbox?
   - CQRS là gì trong dự án này?
   - Adapter Pattern nằm ở đâu?
   - Repository Pattern giải quyết vấn đề gì?
   - Làm sao scale search?
   - Làm sao tránh duplicate deal?
   - Làm sao bảo mật auth?
   - Nếu traffic tăng 10x thì làm gì?
   - Nếu RabbitMQ down thì sao?

Output:

- Dự án sẵn sàng đưa vào CV.
- README đẹp.
- Docs đầy đủ.
- Demo chạy được.

---

## 18. Prompt bắt đầu chạy trong Cursor

Copy đoạn dưới đây vào Cursor để bắt đầu.

```txt
Bạn là senior fullstack architect và tech lead. Hãy đọc file `CURSOR_DEALXIN_MASTER_PROMPT.md` này và thực hiện Phase 0 trước.

Yêu cầu:
1. Không code lớn ngay.
2. Kiểm tra workspace hiện tại.
3. Kiểm tra các MCP servers khả dụng: context7, github, playwright, prisma, supabase, tavily, vercel, notion, agentmemory.
4. Kiểm tra các skill web/frontend đang có, đặc biệt là taste-skill từ Leonxlnx/taste-skill.
5. Dùng Context7 để xác nhận docs mới nhất cho stack chính: Next.js, NestJS, Prisma, PostgreSQL, Docker.
6. Đề xuất kiến trúc MVP trước: modular monolith hay monorepo microservices-ready.
7. Tạo roadmap, ADR đầu tiên, repo structure đề xuất và checklist công việc.
8. Sau khi hoàn thành Phase 0, dừng lại và báo cáo: đã tạo file nào, quyết định kiến trúc nào, phase tiếp theo nên làm gì.

Mục tiêu cuối cùng: xây dựng DealXin — real-time deal/voucher aggregation platform dùng Next.js, NestJS, PostgreSQL, Prisma, Redis, RabbitMQ, Docker, Meilisearch, Playwright, CI/CD, Vercel, design patterns và microservices-ready architecture.
```

---

## 19. Prompt tiếp tục Phase 1

```txt
Tiếp tục Phase 1: Scaffold monorepo cho DealXin.

Hãy:
1. Dùng Context7 kiểm tra docs cần thiết trước khi scaffold.
2. Tạo monorepo bằng package manager phù hợp, ưu tiên pnpm.
3. Tạo `apps/web` với Next.js + TypeScript + Tailwind + shadcn/ui.
4. Tạo `apps/api` với NestJS + TypeScript.
5. Tạo `packages/shared`, `packages/contracts`, `packages/config`.
6. Cấu hình TypeScript strict, ESLint, Prettier.
7. Tạo `.env.example`.
8. Tạo `docker-compose.yml` bước đầu gồm postgres, redis, rabbitmq, meilisearch.
9. Tạo README bản đầu.
10. Chạy lint/typecheck/build nếu có thể.
11. Commit thay đổi bằng GitHub MCP nếu repo đã được kết nối.

Không tạo placeholder rỗng. File nào tạo ra phải có nội dung hữu ích.
```

---

## 20. Prompt tiếp tục Phase 2

```txt
Tiếp tục Phase 2: Database and Auth.

Hãy dùng Prisma MCP và Context7 để:
1. Thiết kế Prisma schema cho User, Role, UserRole, RefreshToken, Deal, DealSource, DealCategory, DealVote, DealBookmark, PriceHistory, Voucher, Notification, CrawlerJob, OutboxEvent, AuditLog.
2. Tạo migration.
3. Tạo seed data gồm admin user, normal user, categories, deal sources, sample deals.
4. Implement auth trong NestJS:
   - register
   - login
   - refresh token
   - logout
   - get current user
5. Implement RBAC guard.
6. Viết tests cho auth.
7. Cập nhật docs/database-erd.md và docs/api-docs.md.
8. Chạy test/lint/typecheck.
```

---

## 21. Prompt tiếp tục Phase 3

```txt
Tiếp tục Phase 3: Deals Core.

Hãy implement:
1. Deal CRUD.
2. User submit deal.
3. Admin approve/reject/expire deal.
4. Deal status transition validation.
5. Vote deal.
6. Bookmark deal.
7. Price history.
8. Deal scoring strategy.

Bắt buộc thể hiện rõ các pattern:
- Repository Pattern
- Strategy Pattern
- State transition rules
- AuditLog

Yêu cầu:
- Controller không chứa business logic.
- Prisma chỉ nằm trong repository implementation.
- DTO validation rõ ràng.
- Swagger/OpenAPI cập nhật.
- Unit/integration tests đầy đủ.
```

---

## 22. Prompt tiếp tục Phase 4

```txt
Tiếp tục Phase 4: Frontend MVP.

Hãy dùng taste-skill, hallmark và các skill frontend đang có.

Quy trình bắt buộc:
1. Dùng taste-skill để tạo design direction.
2. Dùng hallmark để chống UI generic/AI-slop trước khi ship.
3. Nếu có skill redesign/polish/frontend khác, dùng sau khi MVP chạy được.
4. Dùng Playwright để test UI thật.

Trước khi code UI, hãy viết:
Reading this as: a recruiter-facing technical product demo for an intern fullstack portfolio, with a polished SaaS/product-engineering vibe, leaning toward clean editorial layout, strong data/product visuals, restrained motion, and non-generic Tailwind/shadcn composition.

Yêu cầu tạo:
1. Landing page đẹp, không generic.
2. Deals listing page.
3. Deal detail page.
4. Login/Register pages.
5. User dashboard.
6. Admin dashboard.
7. Pending deals moderation page.
8. API client typed.
9. TanStack Query integration.
10. Loading/error/empty states.
11. Responsive mobile.
12. Playwright smoke test.

Với dashboard/admin, ưu tiên clarity-first B2B UI, shadcn/ui và TanStack Table. Không lạm dụng animation.
```

---

## 23. Prompt tiếp tục Phase 5 đến Phase 12

```txt
Tiếp tục thực hiện các phase còn lại trong `CURSOR_DEALXIN_MASTER_PROMPT.md` theo thứ tự:

Phase 5 — Ingestion service and adapters
Phase 6 — Event-driven and microservices-ready
Phase 7 — Search
Phase 8 — Notification and realtime
Phase 9 — Analytics and admin polish
Phase 10 — Observability and CI/CD
Phase 11 — Deployment
Phase 12 — Final recruiter polish

Ở mỗi phase:
1. Nhắc lại mục tiêu phase.
2. Dùng MCP phù hợp:
   - Context7 cho docs
   - Prisma cho schema/migration
   - Playwright cho test UI
   - GitHub cho commit/issue
   - Supabase nếu dùng database cloud
   - Vercel cho deploy frontend
   - Tavily cho research
   - AgentMemory để lưu quyết định
3. Dùng skill phù hợp, đặc biệt taste-skill khi làm UI.
4. Code đầy đủ.
5. Chạy test/lint/typecheck/build.
6. Cập nhật docs.
7. Commit rõ nghĩa.
8. Báo cáo kết quả và phase tiếp theo.
```

---

## 24. Prompt riêng để polish UI bằng Hallmark

Dùng prompt này sau khi một page đã chạy được.

```txt
Use the Hallmark skill to audit the current DealXin UI.

Context:
DealXin is a real-time deal/voucher aggregation platform for Vietnamese ecommerce users. The product should feel fast, useful, trustworthy, community-aware, and recruiter-ready. It should not look like a generic AI-generated SaaS template.

Audit the current page for:
1. AI-slop patterns.
2. Generic hero/features/CTA structure.
3. Weak typography hierarchy.
4. Overused gradient and glassmorphism.
5. Centered-everything layout.
6. Inconsistent spacing.
7. Bad visual rhythm.
8. Repetitive cards.
9. Weak table/dashboard clarity.
10. Fake-looking metrics or claims.
11. Poor mobile responsive behavior.
12. Missing loading/error/empty states.
13. Accessibility issues.
14. Motion without reduced-motion fallback.

Then:
1. Produce a ranked punch list.
2. Fix the top problems.
3. Preserve working logic and API integration.
4. Do not bulldoze the codebase.
5. Keep the design aligned with DealXin, not a generic SaaS.
6. Re-run visual checks.
7. Use Playwright to verify the main user flow still works.
```

---

## 24. Quy tắc chống làm ẩu

Không được:

- Tạo UI generic như template mặc định.
- Viết code giả rồi nói “implement later”.
- Bỏ qua error handling.
- Bỏ qua validation.
- Bỏ qua docs.
- Dùng `any` tràn lan.
- Hardcode secret.
- Bỏ qua test hoàn toàn.
- Tạo microservices giả nhưng thực chất không có event/message.
- Scrape trái phép hoặc bypass anti-bot.
- Để README sơ sài.
- Để dự án không chạy được.

Nếu gặp lỗi:

1. Đọc error kỹ.
2. Dùng Context7/docs nếu liên quan API.
3. Sửa root cause.
4. Chạy lại command.
5. Ghi lại lỗi và cách fix trong docs nếu quan trọng.

---

## 25. Definition of Done

Dự án chỉ được coi là hoàn chỉnh khi có:

- App chạy local bằng một lệnh rõ ràng.
- Frontend chạy được.
- Backend chạy được.
- Database migration/seed chạy được.
- Auth hoạt động.
- Deal flow hoạt động.
- Admin moderation hoạt động.
- Search hoạt động.
- Notification ít nhất bản in-app hoạt động.
- Docker Compose hoạt động.
- README đầy đủ.
- Docs architecture đầy đủ.
- API docs đầy đủ.
- Có test cơ bản.
- Có CI pipeline.
- Có screenshot/demo.
- Có CV bullets.
- Có interview Q&A.
- Có deployment frontend hoặc hướng dẫn deploy rõ ràng.

---

## 26. Kết quả cuối cùng tôi muốn

Sau khi hoàn thành, tôi muốn có:

1. GitHub repo sạch đẹp.
2. Demo link.
3. README nhìn chuyên nghiệp.
4. Docs giải thích kiến trúc.
5. UI đẹp, khác template.
6. Backend có design pattern thật.
7. Event-driven architecture có thể giải thích được.
8. Microservices-ready structure.
9. Test và CI đủ thuyết phục.
10. Nội dung CV + nội dung nói khi phỏng vấn.

Hãy làm dự án như một sản phẩm thật để tôi có thể tự tin đưa cho nhà tuyển dụng intern IT xem.
