import { test, expect } from "@playwright/test";

/**
 * Route-level contract for POST /api/subscribe.
 *
 * These hit the real handler through the dev server rather than the browser,
 * so page.route() cannot help here — instead the assertions are confined to
 * the paths that never touch a backend:
 *
 *   - Zod validation rejects before Resend or HubSpot is ever contacted.
 *   - checkRateLimit() fails open when KV is unreachable (see lib/rate-limit.ts),
 *     so an unconfigured environment still reaches the validation branch.
 *
 * The one browser-level test at the bottom mocks /api/subscribe outright and
 * covers the 429 path, which the UI-level subscribe.spec.ts does not exercise.
 */

test.describe("POST /api/subscribe — validation", () => {
  test("rejects a malformed email with 400", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: { email: "not-an-email" },
    });

    expect(res.status()).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Invalid email address." });
  });

  test("rejects an empty body with 400", async ({ request }) => {
    const res = await request.post("/api/subscribe", { data: {} });

    expect(res.status()).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Invalid email address." });
  });

  test("rejects a non-JSON body with 400 rather than crashing", async ({ request }) => {
    // The handler does `req.json().catch(() => ({}))`, so garbage must degrade
    // into the validation error, never a 500.
    const res = await request.post("/api/subscribe", {
      headers: { "Content-Type": "application/json" },
      data: "this is not json",
    });

    expect(res.status()).toBe(400);
  });

  test("rejects a non-string email with 400", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: { email: 12345 },
    });

    expect(res.status()).toBe(400);
  });

  test("does not expose GET", async ({ request }) => {
    const res = await request.get("/api/subscribe");
    expect(res.status()).toBe(405);
  });
});

test.describe("POST /api/subscribe — accepted input", () => {
  test("a well-formed email passes validation and reaches the provider branch", async ({
    request,
  }) => {
    const res = await request.post("/api/subscribe", {
      data: { email: `e2e-${Date.now()}@example.com` },
    });

    // Past validation, the outcome depends on env: 503 when RESEND_AUDIENCE_ID
    // is unset (the expected CI/local state), 200 when a real audience is
    // configured, 500 if Resend rejects the call. The invariant under test is
    // only that a valid address is never treated as invalid.
    expect(res.status()).not.toBe(400);
    expect([200, 500, 503]).toContain(res.status());
  });
});

test.describe("Subscribe form — rate-limited response", () => {
  test("shows the error state when the API returns 429", async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({
        status: 429,
        headers: { "Retry-After": "3600" },
        json: { error: "Too many requests. Please try again later." },
      })
    );

    await page.goto("/subscribe");
    await page.getByPlaceholder(/you@example\.com/i).fill("reader@example.com");
    await page.getByRole("button", { name: /Subscribe/i }).click();

    // NewsletterCTA collapses every non-success response into one message, so a
    // rate-limited visitor sees the generic error rather than a retry hint.
    await expect(page.getByText(/Something went wrong — please try again/i)).toBeVisible();
  });
});
