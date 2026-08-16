import { test, expect } from "@playwright/test";

/**
 * Route-level contract for /api/save (bookmarks).
 *
 * Every test here runs signed-out, which is the deterministic half of the
 * route: auth() is checked before any KV call, so these assertions hold with
 * no Postgres session store and no KV instance. The signed-in half needs a
 * real session cookie and a live KV, and is deliberately not faked.
 */

test.describe("GET /api/save — signed out", () => {
  test("reports not-saved instead of erroring", async ({ request }) => {
    const res = await request.get("/api/save?type=post&slug=hello-world");

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ saved: false });
  });

  test("reports not-saved when type and slug are missing", async ({ request }) => {
    const res = await request.get("/api/save");

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ saved: false });
  });

  test("never leaks another user's bookmark state", async ({ request }) => {
    // No session -> the handler must short-circuit before building the
    // `saves:<email>` key, whatever slug is requested.
    const res = await request.get("/api/save?type=project&slug=someone-elses-bookmark");

    expect(await res.json()).toEqual({ saved: false });
  });
});

test.describe("POST /api/save — auth gate", () => {
  test("rejects an anonymous save with 401", async ({ request }) => {
    const res = await request.post("/api/save", {
      data: { type: "post", slug: "hello-world" },
    });

    expect(res.status()).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  test("checks auth before validating the body", async ({ request }) => {
    // A body missing type/slug would be a 400 for a signed-in user; signed out
    // it must still be 401, so an anonymous caller cannot probe validation.
    const res = await request.post("/api/save", { data: {} });

    expect(res.status()).toBe(401);
  });
});

test.describe("DELETE /api/save — auth gate", () => {
  test("rejects an anonymous delete with 401", async ({ request }) => {
    const res = await request.delete("/api/save", {
      data: { type: "post", slug: "hello-world" },
    });

    expect(res.status()).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  test("rejects an anonymous delete with an empty body with 401", async ({ request }) => {
    const res = await request.delete("/api/save", { data: {} });

    expect(res.status()).toBe(401);
  });
});

test.describe("/api/save — unsupported methods", () => {
  test("PUT is not routed", async ({ request }) => {
    const res = await request.put("/api/save", { data: { type: "post", slug: "x" } });
    expect(res.status()).toBe(405);
  });
});

test.describe("Bookmark button visibility", () => {
  test("is not rendered for signed-out visitors", async ({ page }) => {
    // BookmarkButton returns null when `authenticated` is false, so the control
    // must be absent on a public page rather than present-and-broken.
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Save for later/i })).toHaveCount(0);
  });
});
