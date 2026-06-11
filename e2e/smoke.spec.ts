import { test, expect } from "@playwright/test";

test.describe("DealXin Smoke Tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DealXin/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("deals page loads", async ({ page }) => {
    await page.goto("/deals");
    await expect(page.getByText("Khám phá")).toBeVisible();
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByPlaceholder(/Tìm kiếm/)).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByLabel(/Email/)).toBeVisible();
    await expect(page.getByLabel(/Mật khẩu/)).toBeVisible();
  });
});
