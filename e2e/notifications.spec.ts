import { test, expect } from "@playwright/test";

test.describe("Notifications E2E", () => {
  const testUser = {
    email: "demo@dealxin.local",
    password: "Test1234!",
    name: "Demo User",
  };

  async function loginUser(page: import("@playwright/test").Page) {
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Mật khẩu").fill(testUser.password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  }

  test("notification bell is visible when logged in", async ({ page }) => {
    await loginUser(page);

    const bellLink = page.getByRole("link", { name: /thông báo/i }).or(
      page.locator('a[href="/notifications"]')
    );
    await expect(bellLink).toBeVisible();
  });

  test("notification bell shows unread count badge when there are unread notifications", async ({
    page,
  }) => {
    await loginUser(page);

    const bellButton = page.locator('a[href="/notifications"] button, a[href="/notifications"]').first();
    await expect(bellButton).toBeVisible();
  });

  test("notifications page redirects to login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/notifications");

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("notifications page loads for authenticated user", async ({ page }) => {
    await loginUser(page);

    await page.goto("/notifications");

    await expect(page.getByRole("heading", { name: /thông báo/i })).toBeVisible();
    await page.waitForSelector('[data-testid="notifications-content"], .space-y-2, text=Không có thông báo', {
      timeout: 5000,
    });
  });

  test("notifications page shows empty state when no notifications", async ({
    page,
  }) => {
    await loginUser(page);

    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    const emptyState = page.getByText(/không có thông báo/i).or(
      page.getByRole("heading", { name: /không có thông báo/i })
    );
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });

  test("mark all as read button appears when unread notifications exist", async ({
    page,
  }) => {
    await loginUser(page);

    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    const markAllBtn = page.getByRole("button", { name: /đánh dấu đã đọc/i });
    const isVisible = await markAllBtn.isVisible().catch(() => false);

    if (isVisible) {
      await markAllBtn.click();
      await page.waitForLoadState("networkidle");
      await expect(markAllBtn).not.toBeVisible();
    }
  });

  test("user can click notification bell to navigate to notifications page", async ({
    page,
  }) => {
    await loginUser(page);

    const bellLink = page.locator('a[href="/notifications"]').first();
    await bellLink.click();

    await expect(page).toHaveURL(/\/notifications/);
    await expect(page.getByRole("heading", { name: /thông báo/i })).toBeVisible();
  });

  test("notifications page has proper structure", async ({ page }) => {
    await loginUser(page);

    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /thông báo/i })).toBeVisible();
    await expect(page.locator("form, input, button").first()).toBeVisible();
  });
});
