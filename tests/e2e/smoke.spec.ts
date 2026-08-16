import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero section with title and CTA buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Jose Leos/i);

    // Hero heading. The middle word rotates through ROLES (PRODUCTS,
    // INTERFACES, …), so only the fixed words are asserted.
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText(/BUILDING/i);
    await expect(heading).toContainText(/THAT SHIP/i);

    // CTA buttons
    await expect(page.getByRole("link", { name: /View Selected Work/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Read the Journal/i })).toBeVisible();
  });

  test("nav links are present", async ({ page, isMobile }) => {
    await page.goto("/");

    // The desktop nav is `hidden md:flex`; on a mobile viewport the same links
    // live behind the hamburger, so open it first.
    if (isMobile) {
      await page.getByRole("button", { name: /Toggle menu/i }).click();
    }

    await expect(page.getByRole("link", { name: /Blog/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Portfolio/i }).first()).toBeVisible();
  });
});

test.describe("Blog page", () => {
  test("loads and shows the page heading", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /Blog/i, level: 1 })).toBeVisible();
  });

  test("has RSS feed link in head", async ({ page }) => {
    await page.goto("/blog");
    const rss = page.locator('link[type="application/rss+xml"]');
    await expect(rss).toHaveAttribute("href", /feed\.xml/);
  });
});

test.describe("Portfolio page", () => {
  test("loads and shows the page heading", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page.getByRole("heading", { name: /Portfolio/i, level: 1 })).toBeVisible();
  });
});

test.describe("Static content pages", () => {
  test("/uses page loads", async ({ page }) => {
    await page.goto("/uses");
    await expect(page.getByRole("heading", { name: /Uses/i, level: 1 })).toBeVisible();
  });

  test("/now page loads", async ({ page }) => {
    await page.goto("/now");
    await expect(page.getByRole("heading", { name: /Now/i, level: 1 })).toBeVisible();
  });

  test("/resume page loads", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.getByRole("heading", { name: /Jose Leos/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Download PDF/i })).toBeVisible();
  });

  test("/speaking page loads", async ({ page }) => {
    await page.goto("/speaking");
    await expect(page.getByRole("heading", { name: /Speaking/i, level: 1 })).toBeVisible();
  });

  test("/about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /About Me/i, level: 1 })).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("shows custom not-found page for unknown routes", async ({ page }) => {
    // The not-found route is compiled on first hit by `next dev`, which can
    // exceed the default 30s budget on a cold run.
    test.setTimeout(90_000);

    await page.goto("/this-route-definitely-does-not-exist-xyz");
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to Home/i })).toBeVisible();
  });
});
