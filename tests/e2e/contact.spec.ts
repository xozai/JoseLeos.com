import { test, expect } from "@playwright/test";

test.describe("Contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("renders the contact form fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Get in Touch/i, level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder(/Your name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/you@example.com/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/What.s this about/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Tell me more/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Send Message/i })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /Send Message/i }).click();
    // At least one validation error should appear
    await expect(page.locator("text=/at least/i").first()).toBeVisible();
  });

  test("shows error for short name", async ({ page }) => {
    await page.getByPlaceholder(/Your name/i).fill("A");
    await page.getByRole("button", { name: /Send Message/i }).click();
    await expect(page.locator("text=/at least 2/i")).toBeVisible();
  });

  test("submit button is disabled while loading", async ({ page }) => {
    // Mock the API so it hangs briefly
    await page.route("/api/contact", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({ json: { ok: true } });
    });

    await page.getByPlaceholder(/Your name/i).fill("Test User");
    await page.getByPlaceholder(/you@example.com/i).first().fill("test@example.com");
    await page.getByPlaceholder(/What.s this about/i).fill("Hello there");
    await page.getByPlaceholder(/Tell me more/i).fill("This is a test message with enough characters.");

    await page.getByRole("button", { name: /Send Message/i }).click();
    await expect(page.getByRole("button", { name: /Sending/i })).toBeDisabled();
  });

  test("shows success state after successful submission", async ({ page }) => {
    // Mock a successful API response
    await page.route("/api/contact", (route) =>
      route.fulfill({ json: { ok: true } })
    );

    await page.getByPlaceholder(/Your name/i).fill("Test User");
    await page.getByPlaceholder(/you@example.com/i).first().fill("test@example.com");
    await page.getByPlaceholder(/What.s this about/i).fill("Hello there");
    await page.getByPlaceholder(/Tell me more/i).fill("This is a test message with enough characters.");

    await page.getByRole("button", { name: /Send Message/i }).click();
    await expect(page.locator("text=Message sent!")).toBeVisible({ timeout: 5000 });
  });
});
