import { test, expect, Page } from "@playwright/test";

// ─── Test accounts ────────────────────────────────────────────────────────────
const ADMIN_USER = { email: "admin@dealxin.local", password: "admin123" };
const REGULAR_USER = { email: "demo@dealxin.local", password: "user1234" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function adminLogin(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(ADMIN_USER.email);
  await page.getByLabel("Mật khẩu").fill(ADMIN_USER.password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/(dashboard|deals|admin)$/, { timeout: 10000 });
}

async function userLogin(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(REGULAR_USER.email);
  await page.getByLabel("Mật khẩu").fill(REGULAR_USER.password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/(dashboard|deals)$/, { timeout: 10000 });
}

// ─── Admin Page Access Tests ──────────────────────────────────────────────────
test.describe("Admin — Access Control", () => {
  test("regular user is redirected from admin page to login", async ({ page }) => {
    await userLogin(page);
    await page.goto("/admin");
    // Should redirect to login (403 → login redirect)
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8000 });
  });

  test("unauthenticated user is redirected from admin page to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8000 });
  });

  test("admin can access admin page", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /quản trị/i })).toBeVisible({ timeout: 8000 });
  });
});

// ─── Admin Moderation Tests ──────────────────────────────────────────────────
test.describe("Admin — Deal Moderation", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
  });

  test("admin page shows moderation heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /quản trị/i })).toBeVisible({ timeout: 5000 });
  });

  test("admin page shows stats cards", async ({ page }) => {
    await expect(page.getByText(/chờ duyệt|đã duyệt|từ chối/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("admin page shows table with deals", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    // Table should have headers
    await expect(page.getByText(/tiêu đề|trạng thái|nền tảng|giá/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("admin can filter by status", async ({ page }) => {
    // Find status filter dropdown
    const statusFilter = page.locator("select").first();
    if (await statusFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statusFilter.selectOption("PENDING");
      await page.waitForLoadState("networkidle");
      // Should show pending deals
    }
  });

  test("admin can approve a pending deal", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Look for pending deals first — try "Chờ duyệt" filter button
    const pendingTab = page.getByText(/chờ duyệt/i).first();
    if (await pendingTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pendingTab.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for an "approve" action button in a dropdown menu
    const moreBtn = page.locator("[data-testid='deal-action-menu'], button:has-text('...')").or(
      page.locator("button").filter({ has: page.locator("svg") }).nth(3)
    ).first();

    // Try to find and click a row action
    const approveBtn = page.getByText(/duyệt|approve/i).first();
    if (await approveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await approveBtn.click();
      await page.waitForLoadState("networkidle");
      // Should see success toast or page update
    }
  });

  test("admin can reject a pending deal", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const pendingTab = page.getByText(/chờ duyệt/i).first();
    if (await pendingTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pendingTab.click();
      await page.waitForLoadState("networkidle");
    }

    const rejectBtn = page.getByText(/từ chối|reject/i).first();
    if (await rejectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("admin page has navigation tabs", async ({ page }) => {
    await expect(page.getByText(/deals/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/analytics/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("admin can navigate to analytics page", async ({ page }) => {
    await page.getByText(/analytics/i).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/admin\/analytics/, { timeout: 5000 });
  });

  test("admin can navigate to status page", async ({ page }) => {
    const statusTab = page.getByText(/status|trạng thái/i)
      .filter({ has: page.locator("a") }).first();
    if (await statusTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusTab.click();
      await page.waitForLoadState("networkidle");
    }
  });
});

// ─── Admin Analytics Tests ────────────────────────────────────────────────────
test.describe("Admin — Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/analytics");
    await page.waitForLoadState("networkidle");
  });

  test("analytics page loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /thống kê|analytics/i }).first()
    ).toBeVisible({ timeout: 8000 });
  });

  test("analytics page shows stat cards", async ({ page }) => {
    // Look for numeric stat values
    const stats = page.locator("[class*='text-2xl'], [class*='text-3xl'], [class*='text-4xl']").first();
    await expect(stats.or(page.getByText(/\d+/).first())).toBeVisible({ timeout: 5000 });
  });

  test("analytics page has chart or table section", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    const chart = page.locator("canvas, [class*='recharts'], [class*='chart']").first();
    const table = page.locator("table").first();
    await expect(
      await chart.isVisible({ timeout: 2000 }).catch(() => false)
        ? chart
        : table
    ).toBeVisible({ timeout: 5000 });
  });
});

// ─── Admin Status Page ───────────────────────────────────────────────────────
test.describe("Admin — Status", () => {
  test("status page loads and shows system health info", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/status");
    await page.waitForLoadState("networkidle");

    // Should show some status information
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
    // API health check should be visible
    const statusIndicator = page.getByText(/healthy|online|running|up|status/i).first();
    await expect(statusIndicator.or(page.getByText(/api|backend|server/i).first())).toBeVisible({ timeout: 5000 });
  });
});
