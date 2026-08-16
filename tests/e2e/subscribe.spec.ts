import { test, expect } from "@playwright/test";

/**
 * Newsletter signup coverage. /api/subscribe is always mocked — the real route
 * talks to Resend and HubSpot, neither of which is reachable in CI.
 */

test.describe("Subscribe page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/subscribe");
  });

  test("renders the heading and signup form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Get the newsletter/i, level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Subscribe/i })).toBeVisible();
  });

  test("links back to the newsletter archive", async ({ page }) => {
    await page.getByRole("link", { name: /Browse past issues/i }).click();
    await expect(page).toHaveURL(/\/newsletter$/);
  });

  test("email field is a required email input", async ({ page }) => {
    const email = page.getByPlaceholder(/you@example\.com/i);
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("required", "");
  });

  test("an invalid email does not submit the form", async ({ page }) => {
    let called = false;
    await page.route("**/api/subscribe", (route) => {
      called = true;
      return route.fulfill({ json: { success: true } });
    });

    await page.getByPlaceholder(/you@example\.com/i).fill("nope");
    await page.getByRole("button", { name: /Subscribe/i }).click();

    // Native constraint validation blocks the request entirely.
    await expect(page.getByRole("button", { name: /Subscribe/i })).toBeVisible();
    expect(called).toBe(false);
  });

  test("shows the success state after subscribing", async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ json: { success: true } })
    );

    await page.getByPlaceholder(/you@example\.com/i).fill("reader@example.com");
    await page.getByRole("button", { name: /Subscribe/i }).click();

    await expect(page.getByText(/You.re subscribed!/i)).toBeVisible();
  });

  test("tells an existing subscriber they are already signed up", async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ json: { alreadySubscribed: true } })
    );

    await page.getByPlaceholder(/you@example\.com/i).fill("returning@example.com");
    await page.getByRole("button", { name: /Subscribe/i }).click();

    await expect(page.getByText(/You.re already subscribed/i)).toBeVisible();
  });

  test("shows an error state when the API fails", async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ status: 500, json: { error: "Failed to subscribe. Please try again." } })
    );

    await page.getByPlaceholder(/you@example\.com/i).fill("reader@example.com");
    await page.getByRole("button", { name: /Subscribe/i }).click();

    await expect(page.getByText(/Something went wrong — please try again/i)).toBeVisible();
  });

  test("shows an error state when the newsletter is unconfigured", async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ status: 503, json: { error: "Newsletter not configured." } })
    );

    await page.getByPlaceholder(/you@example\.com/i).fill("reader@example.com");
    await page.getByRole("button", { name: /Subscribe/i }).click();

    await expect(page.getByText(/Something went wrong — please try again/i)).toBeVisible();
  });

  test("disables the button while the request is in flight", async ({ page }) => {
    await page.route("**/api/subscribe", async (route) => {
      await new Promise((r) => setTimeout(r, 750));
      await route.fulfill({ json: { success: true } });
    });

    await page.getByPlaceholder(/you@example\.com/i).fill("reader@example.com");
    await page.getByRole("button", { name: /Subscribe/i }).click();

    await expect(page.getByRole("button", { name: "…" })).toBeDisabled();
  });
});
