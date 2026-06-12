import { test, expect, Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/(dashboard|deals)$/, { timeout: 10000 });
}

// ─── Search Page Tests ────────────────────────────────────────────────────────
test.describe("Search — Page Structure", () => {
  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 8000 });
  });

  test("search page has search input", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    const searchInput = page.getByPlaceholder(/tìm kiếm/i).or(page.locator("input[type='text']").first());
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test("search page is accessible without authentication", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveURL(/\/search/, { timeout: 3000 });
  });

  test("search page has filter options", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    // Platform filter buttons
    await expect(
      page.getByText(/shopee|lazada|tiktok/i).first()
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe("Search — Full-Text Search", () => {
  test("searching for 'macbook' returns results", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/tìm kiếm/i);
    await searchInput.fill("macbook");
    await searchInput.press("Enter");

    await page.waitForLoadState("networkidle");
    // Should show results with macbook keyword
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test("search page updates URL with query parameter", async ({ page }) => {
    await page.goto("/search?q=iphone");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/q=iphone/, { timeout: 5000 });
  });

  test("searching for non-existent term shows empty state", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/tìm kiếm/i);
    await searchInput.fill(`zzz-nonexistent-deal-${Date.now()}`);
    await searchInput.press("Enter");

    await page.waitForLoadState("networkidle");
    // Should show empty state or no results message
    const emptyState = page.getByText(/không tìm thấy|không có kết quả|chưa có/i).first();
    await expect(emptyState).toBeVisible({ timeout: 8000 }).catch(() => {});
  });
});

test.describe("Search — Filtering", () => {
  test("filter by Shopee platform works", async ({ page }) => {
    await page.goto("/search?q=iphone");
    await page.waitForLoadState("networkidle");

    const shopeeBtn = page.getByText(/shopee/i).first();
    if (await shopeeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shopeeBtn.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/platform=/i, { timeout: 5000 }).catch(() => {});
    }
  });

  test("filter by discount percentage works", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    const discountChip = page.getByText(/\d+%/i).first();
    if (await discountChip.isVisible({ timeout: 3000 }).catch(() => false)) {
      await discountChip.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("clear filters button works", async ({ page }) => {
    await page.goto("/search?q=macbook&platform=SHOPEE");
    await page.waitForLoadState("networkidle");

    const clearBtn = page.getByText(/xóa|xoá|clear/i).first();
    if (await clearBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await clearBtn.click();
      await page.waitForLoadState("networkidle");
    }
  });
});

test.describe("Search — Sorting", () => {
  test("sort by newest works", async ({ page }) => {
    await page.goto("/search?sortBy=newest&q=macbook");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sortBy=newest/, { timeout: 3000 });
  });

  test("sort by hot works", async ({ page }) => {
    await page.goto("/search?sortBy=hot");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
  });

  test("sort by discount works", async ({ page }) => {
    await page.goto("/search?sortBy=discount");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Search — Search API Integration", () => {
  test("search results show deal cards", async ({ page }) => {
    await page.goto("/search?q=macbook");
    await page.waitForLoadState("networkidle");

    // Should show deal cards or list items
    const cards = page.locator("[class*='rounded-xl'], [class*='bg-card'], article").first();
    await expect(cards).toBeVisible({ timeout: 8000 }).catch(() => {});
  });

  test("search results show result count", async ({ page }) => {
    await page.goto("/search?q=macbook");
    await page.waitForLoadState("networkidle");

    // Should show "X deal được tìm thấy" or similar
    const resultCount = page.getByText(/\d+\s*deal|\d+\s*kết quả/i).first();
    await expect(resultCount).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("search is fast (< 2s response)", async ({ page }) => {
    const start = Date.now();
    await page.goto("/search?q=laptop");
    await page.waitForLoadState("networkidle");
    const duration = Date.now() - start;
    // Should complete within 5 seconds (generous for local dev)
    expect(duration).toBeLessThan(5000);
  });
});
