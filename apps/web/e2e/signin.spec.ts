import { test, expect } from "@playwright/test";

// Uses seeded demo user: demo@makemyownmodel.ai / demo-password (run db:seed first)
test.describe("sign-in", () => {
  test("signing in with valid demo credentials redirects away from signin", async ({ page }) => {
    await page.goto("/signin");

    await page.getByLabel(/email/i).fill("demo@makemyownmodel.ai");
    await page.getByLabel(/password/i).fill("demo-password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).not.toHaveURL(/\/signin$/);
  });

  test("signing in with invalid credentials shows error and stays on signin", async ({ page }) => {
    await page.goto("/signin");

    await page.getByLabel(/email/i).fill("demo@makemyownmodel.ai");
    await page.getByLabel(/password/i).fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
