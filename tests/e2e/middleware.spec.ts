import { test, expect } from "@playwright/test";

/**
 * Route-protection coverage for proxy.ts. Every test here runs with a clean,
 * signed-out context, so these assert the unauthenticated path only — no
 * session cookie is ever minted and no backend is contacted.
 */

const GATED_ROUTES = ["/dashboard", "/account"];

test.describe("Gated routes redirect signed-out visitors to /login", () => {
  for (const route of GATED_ROUTES) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
    });

    test(`${route} lands on a usable sign-in form`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByLabel(/Email address/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Send magic link/i })).toBeVisible();
    });

    test(`${route} sub-paths are also protected`, async ({ page }) => {
      await page.goto(`${route}/some/nested/path`);
      await expect(page).toHaveURL(/\/login$/);
    });
  }
});

test.describe("Public routes are not gated", () => {
  for (const route of ["/", "/about", "/contact", "/subscribe"]) {
    test(`${route} renders without redirecting to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).not.toHaveURL(/\/login/);
    });
  }
});

test.describe("Middleware matcher scope", () => {
  test("a route merely prefixed with 'account' is not gated", async ({ page }) => {
    // The matcher is /account/:path* — an unrelated route sharing the prefix
    // should fall through to the normal 404, not the login redirect.
    await page.goto("/accounts-payable-does-not-exist");
    await expect(page).not.toHaveURL(/\/login/);
  });
});
