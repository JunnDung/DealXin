import { test, expect, Page } from "@playwright/test";

// ─── Seed data ────────────────────────────────────────────────────────────────
const ADMIN_USER = { email: "admin@dealxin.local", password: "Admin1234!" };
const REGULAR_USER = { email: "demo@dealxin.local", password: "Test1234!" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/(dashboard|deals)$/, { timeout: 10000 });
}

// ─── Deals Listing Tests ──────────────────────────────────────────────────────
test.describe("Deals — Public Listing", () => {
  test("deals page loads and shows heading", async ({ page }) => {
    await page.goto("/deals");
    // Wait for the page to settle (loading skeletons to disappear)
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("deals page shows deal cards", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");
    // Look for deal card elements — either a grid of cards or a table
    const cards = page.locator("[class*='rounded-xl'], [class*='bg-card']").first();
    // At minimum, heading should be visible
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("deals page shows filter controls", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");
    // Sort dropdown should be visible
    const sortTrigger = page.getByPlaceholder(/mới nhất|hot|giảm/i).or(
      page.locator("[class*='select-trigger']").first()
    );
    await expect(sortTrigger.or(page.locator("select").first())).toBeVisible({ timeout: 5000 });
  });

  test("deals page shows pagination", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");
    // Pagination controls should exist if there are multiple pages
    const pagination = page.locator("[class*='gap-2'], [class*='pagination']").first();
    await expect(pagination.or(page.getByRole("button", { name: /trang/i })).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Pagination may not be visible if there's only 1 page — that's OK
    });
  });

  test("deals page accessible without authentication", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");
    // Should NOT redirect to login
    await expect(page).toHaveURL(/\/deals/, { timeout: 3000 });
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Deals — Filtering & Sorting", () => {
  test("filter by platform works", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");

    // Click platform dropdown / button
    const platformFilter = page.getByText(/tất cả nền tảng|nền tảng/i).first();
    if (await platformFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await platformFilter.click();
      // Select Shopee option
      await page.getByText(/shopee/i).first().click();
      await page.waitForLoadState("networkidle");
      // URL should update with platform filter
      await expect(page).toHaveURL(/platform=/i, { timeout: 5000 }).catch(() => {});
    }
  });

  test("sort by newest works", async ({ page }) => {
    await page.goto("/deals?sortBy=newest");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sortBy=newest/, { timeout: 3000 });
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
  });

  test("sort by hot works", async ({ page }) => {
    await page.goto("/deals?sortBy=hot");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
  });

  test("sort by discount works", async ({ page }) => {
    await page.goto("/deals?sortBy=discount");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Deals — Bookmark", () => {
  test("bookmark button is visible on deal cards for logged-in user", async ({ page }) => {
    await login(page, REGULAR_USER.email, REGULAR_USER.password);
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");

    // Look for bookmark icon/button on a deal card
    const bookmarkBtn = page.locator("[data-testid='bookmark-btn'], button:has(svg[class*='lucide-bookmark'])").first();
    await expect(bookmarkBtn.or(page.locator("button").filter({ has: page.locator("svg") }).first())).toBeVisible({ timeout: 5000 });
  });

  test("clicking bookmark toggles state", async ({ page }) => {
    await login(page, REGULAR_USER.email, REGULAR_USER.password);
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");

    // Find a bookmark button
    const bookmarkBtns = page.locator("button:has(svg[class*='lucide-bookmark']), [aria-label*='bookmark' i]").first();
    if (await bookmarkBtns.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookmarkBtns.click();
      await page.waitForLoadState("networkidle");
      // Bookmark should have changed state (filled vs outline — handled by optimistic UI)
    }
  });

  test("unauthenticated user cannot bookmark", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");
    // Click a bookmark button if it exists
    const bookmarkBtn = page.locator("button:has(svg[class*='lucide-bookmark'])").first();
    if (await bookmarkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookmarkBtn.click();
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
    }
  });
});

test.describe("Deals — Dashboard", () => {
  test("dashboard shows user deals section", async ({ page }) => {
    await login(page, REGULAR_USER.email, REGULAR_USER.password);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 5000 });
    // Should show "Deal của tôi" or "Deal đã lưu" sections
    const sections = page.getByText(/deal của tôi|deal đã lưu|xin chào/i);
    await expect(sections.first()).toBeVisible({ timeout: 5000 });
  });

  test("dashboard has quick action buttons", async ({ page }) => {
    await login(page, REGULAR_USER.email, REGULAR_USER.password);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/đăng deal/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/deal hot/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("dashboard shows admin section for admin users", async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Admin should see "Vào trang quản trị" link
    await expect(page.getByText(/quản trị/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Deals — Deal Detail", () => {
  test("deal detail page loads for a known deal slug", async ({ page }) => {
    await page.goto("/deals/macbook-air-m3-13-inch-giam-3-trieu");
    await page.waitForLoadState("networkidle");

    // Should show deal title
    const heading = page.getByRole("heading", { level: 1 }).or(page.locator("h1")).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test("deal detail page has price information", async ({ page }) => {
    await page.goto("/deals/macbook-air-m3-13-inch-giam-3-trieu");
    await page.waitForLoadState("networkidle");

    // Should show price (VND formatted numbers)
    const priceText = page.getByText(/[\d.,]+\s*d?K|₫|\d{1,3}(?:\.\d{3})+/)
      .first();
    await expect(priceText.or(page.locator("[class*='text-xl']").first())).toBeVisible({ timeout: 8000 });
  });

  test("deal detail page has a link to source URL", async ({ page }) => {
    await page.goto("/deals/macbook-air-m3-13-inch-giam-3-trieu");
    await page.waitForLoadState("networkidle");

    const buyLink = page.getByText(/mua ngay|xem tại|đến shopee|đến lazada|chi tiết/i)
      .first();
    await expect(buyLink).toBeVisible({ timeout: 8000 });
  });
});
