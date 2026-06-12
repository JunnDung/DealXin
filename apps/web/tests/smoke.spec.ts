import { expect, test } from "@playwright/test";

test.describe("DealXin Smoke Tests", () => {
  test("home page loads without errors", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DealXin/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation header is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("deals page loads", async ({ page }) => {
    await page.goto("/deals");
    await expect(page.locator("h1,h2").first()).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mật khẩu/i)).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(
      page.getByRole("heading", { name: /tạo tài khoản/i }),
    ).toBeVisible();
  });

  test("login form validates required fields", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await expect(page.getByText(/email không hợp lệ/i)).toBeVisible();
  });

  test("register form validates password mismatch", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByLabel(/họ và tên/i).fill("Nguyen Van A");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^mật khẩu$/i).fill("password123");
    await page.getByLabel(/xác nhận/i).fill("different");
    await page.getByRole("button", { name: /tạo tài khoản/i }).click();
    await expect(page.getByText(/mật khẩu không khớp/i)).toBeVisible();
  });

  test("footer is visible on home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});
