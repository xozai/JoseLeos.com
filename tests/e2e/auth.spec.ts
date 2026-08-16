import { test, expect } from "@playwright/test";

/**
 * Auth flow coverage. No real email is ever sent: the NextAuth REST endpoints
 * under /api/auth/** are mocked so `signIn("resend", ...)` resolves without
 * touching Resend or Postgres.
 */

/**
 * Minimal stand-in for the NextAuth endpoints `signIn()` hits.
 *
 * `signInUrl` is resolved to an absolute URL before it is returned. next-auth
 * v5's client does `new URL(data.url)` on the response to read the error code
 * out of the query string, which throws TypeError on a relative path or null —
 * that rejection propagates out of signIn() so the page neither navigates nor
 * shows its error state. Signal failure with an `?error=` param instead.
 */
async function mockNextAuth(
  page: import("@playwright/test").Page,
  signInUrl: string
) {
  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({ json: { csrfToken: "test-csrf-token" } })
  );
  await page.route("**/api/auth/providers", (route) =>
    route.fulfill({
      json: {
        resend: {
          id: "resend",
          name: "Resend",
          type: "email",
          signinUrl: "/api/auth/signin/resend",
          callbackUrl: "/api/auth/callback/resend",
        },
      },
    })
  );
  await page.route("**/api/auth/signin/resend**", (route) =>
    route.fulfill({
      json: { url: new URL(signInUrl, route.request().url()).toString() },
    })
  );
}

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders the sign-in card with email field and submit button", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Jose Leos/i })).toBeVisible();
    await expect(page.getByText(/Sign in to access member content/i)).toBeVisible();
    await expect(page.getByLabel(/Email address/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Send magic link/i })).toBeVisible();
  });

  test("explains that no password is required", async ({ page }) => {
    await expect(page.getByText(/secure sign-in link\. No password required/i)).toBeVisible();
  });

  test("email field is a required email input", async ({ page }) => {
    const email = page.getByLabel(/Email address/i);
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("required", "");
    await expect(email).toHaveAttribute("placeholder", /you@example\.com/i);
  });

  test("an invalid email keeps the user on the login page", async ({ page }) => {
    await page.getByLabel(/Email address/i).fill("not-an-email");
    await page.getByRole("button", { name: /Send magic link/i }).click();

    // Native constraint validation blocks submission — no navigation occurs.
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: /Send magic link/i })).toBeVisible();
  });

  test("a valid email sends the user to the verify page", async ({ page }) => {
    await mockNextAuth(page, "/login/verify");

    await page.getByLabel(/Email address/i).fill("visitor@example.com");
    await page.getByRole("button", { name: /Send magic link/i }).click();

    await expect(page).toHaveURL(/\/login\/verify$/);
  });

  test("shows an inline error when sign-in fails", async ({ page }) => {
    await mockNextAuth(page, "/login?error=EmailSignInError");

    await page.getByLabel(/Email address/i).fill("visitor@example.com");
    await page.getByRole("button", { name: /Send magic link/i }).click();

    await expect(page.getByText(/Something went wrong\. Please try again\./i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("Magic-link verify page", () => {
  test("tells the user to check their email", async ({ page }) => {
    await page.goto("/login/verify");
    await expect(page.getByRole("heading", { name: /Check your email/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/We sent a magic link/i)).toBeVisible();
  });

  test("offers a way back to try a different email", async ({ page }) => {
    await page.goto("/login/verify");
    await page.getByRole("link", { name: /Use a different email/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("Sign-in error page", () => {
  test("shows the generic message with no error code", async ({ page }) => {
    await page.goto("/login/error");
    await expect(page.getByRole("heading", { name: /Sign-in failed/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/An unexpected error occurred/i)).toBeVisible();
  });

  test("explains an expired or reused magic link", async ({ page }) => {
    await page.goto("/login/error?error=Verification");
    await expect(
      page.getByText(/magic link has expired or has already been used/i)
    ).toBeVisible();
  });

  test("explains a denied sign-in", async ({ page }) => {
    await page.goto("/login/error?error=AccessDenied");
    await expect(page.getByText(/do not have permission to sign in/i)).toBeVisible();
  });

  test("falls back to the generic message for an unknown code", async ({ page }) => {
    await page.goto("/login/error?error=SomethingUnmapped");
    await expect(page.getByText(/An unexpected error occurred/i)).toBeVisible();
  });

  test("the try-again link returns to login", async ({ page }) => {
    await page.goto("/login/error");
    await page.getByRole("link", { name: /Try again/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
