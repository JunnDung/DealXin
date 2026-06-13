# Testing Guide

## Overview

DealXin uses a multi-layered testing strategy:

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Jest | Business logic, services, utilities |
| Integration | Jest + Supertest | API endpoints |
| E2E | Playwright | Full user flows |
| Smoke | Playwright | Critical path verification |

## Running Tests

```bash
# All tests
pnpm test

# API unit tests
pnpm --filter api test

# Web tests
pnpm --filter web test

# E2E tests (requires running dev server)
pnpm --filter web test:e2e

# With coverage
pnpm --filter api test:cov
```

## Test Structure

```
apps/
├── api/
│   └── src/
│       └── __tests__/          # Jest unit + integration tests
│           ├── deals/
│           │   ├── deals.service.spec.ts
│           │   └── deals.controller.spec.ts
│           └── auth/
│               └── auth.service.spec.ts
└── web/
    ├── e2e/                    # Playwright E2E tests
    │   ├── smoke.spec.ts
    │   ├── notifications.spec.ts
    │   └── auth.spec.ts
    └── src/
        └── __tests__/          # Web unit tests
```

## Writing Tests

### API Unit Tests

```typescript
describe("DealsService", () => {
  let service: DealsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DealsService, PrismaService],
    }).compile();

    service = module.get(DealsService);
    prisma = module.get(PrismaService);
  });

  it("should find approved deals", async () => {
    const deals = await service.findApproved({ page: 1, limit: 10 });
    expect(deals.data).toBeDefined();
    expect(Array.isArray(deals.data)).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe("POST /api/deals", () => {
  it("should require authentication", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/deals")
      .send({ title: "Test" });
    expect(res.status).toBe(401);
  });

  it("should create a deal for authenticated user", async () => {
    const token = await getAuthToken();
    const res = await request(app.getHttpServer())
      .post("/api/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Deal",
        salePrice: 99000,
        originalPrice: 199000,
        platform: "SHOPEE",
        categoryId: "some-category-id",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Test Deal");
  });
});
```

### E2E Tests

```typescript
test("user can submit and view a deal", async ({ page }) => {
  // Login
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  // Submit deal
  await page.goto("/deals/new");
  await page.getByLabel("Tiêu đề").fill("iPhone 16 Pro Max Sale");
  await page.getByLabel("Giá Sale").fill("999000");
  await page.getByRole("button", { name: "Đăng deal" }).click();

  // Verify
  await expect(page.getByText("iPhone 16 Pro Max Sale")).toBeVisible();
});
```

## CI Integration

Tests run automatically on every push via GitHub Actions:

```yaml
# .github/workflows/ci.yml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm test
    - run: pnpm test:e2e
```

## Test Data

### Seeded Users (development)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dealxin.local | admin123 |
| User | demo@dealxin.local | user1234 |
| User | anh.nguyen@email.com | user1234 |
| User | minh.tran@email.com | user1234 |

### Test Categories

Pre-seeded categories: Điện thoại, Laptop, Tablet, Phụ kiện, Thời trang, Làm đẹp, Gia dụng, Thể thao

## Mock Platforms

The ingestion system uses mock adapters that return static data with artificial delays:

- MockShopeeAdapter: 5 deals with 500ms delay
- MockLazadaAdapter: 3 deals with 300ms delay
- MockTikTokShopAdapter: 3 deals with 400ms delay

## Coverage Goals

| Layer | Current | Target |
|-------|---------|--------|
| API Services | ~60% | 80% |
| API Controllers | ~70% | 85% |
| Web Components | ~40% | 70% |
| E2E Flows | 5 flows | 15 flows |
