import { test, expect } from "@playwright/test";

/**
 * Route-level contract for /api/react/[slug] (emoji reactions).
 *
 * POST is deterministic signed-out: checkRateLimit() fails open when KV is
 * unreachable, so the request lands on the auth gate and returns 401 without
 * a backend.
 *
 * GET is not — it calls kv.get()/kv.sismember() directly with no try/catch, so
 * it 500s when Vercel KV is unconfigured. Those tests skip themselves in that
 * case rather than failing, and assert the real shape wherever KV exists.
 */

const SUPPORTED_EMOJIS = ["👍", "❤️", "🔥"];
const SLUG = "e2e-reactions-fixture";

test.describe("POST /api/react/[slug] — auth gate", () => {
  test("rejects an anonymous reaction with 401", async ({ request }) => {
    const res = await request.post(`/api/react/${SLUG}`, {
      data: { emoji: "👍" },
    });

    expect(res.status()).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  test("checks auth before validating the emoji", async ({ request }) => {
    // An unsupported emoji is a 400 for a signed-in user. Signed out it must
    // still be 401 — the gate comes first, so anonymous callers cannot probe
    // which emoji the server accepts.
    const res = await request.post(`/api/react/${SLUG}`, {
      data: { emoji: "🚀" },
    });

    expect(res.status()).toBe(401);
  });

  test("rejects an anonymous reaction on any slug", async ({ request }) => {
    const res = await request.post("/api/react/some-other-post", {
      data: { emoji: "🔥" },
    });

    expect(res.status()).toBe(401);
  });

  test("does not expose PUT", async ({ request }) => {
    const res = await request.put(`/api/react/${SLUG}`, { data: { emoji: "👍" } });
    expect(res.status()).toBe(405);
  });
});

test.describe("GET /api/react/[slug] — counts", () => {
  test("returns a count for each supported emoji", async ({ request }) => {
    const res = await request.get(`/api/react/${SLUG}`);

    // ENV: no Vercel KV in this environment. The handler calls kv.get()
    // unguarded, so it 500s rather than degrading to zeroes.
    test.skip(
      res.status() >= 500,
      "Vercel KV is not configured — GET /api/react/[slug] calls kv.get() with no fallback"
    );

    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const emoji of SUPPORTED_EMOJIS) {
      expect(typeof body.counts[emoji]).toBe("number");
    }
  });

  test("returns no per-user reactions for an anonymous caller", async ({ request }) => {
    const res = await request.get(`/api/react/${SLUG}`);

    test.skip(
      res.status() >= 500,
      "Vercel KV is not configured — GET /api/react/[slug] calls kv.get() with no fallback"
    );

    const body = await res.json();
    // userReactions is only populated for a session with an email, so a signed
    // out caller must get an empty map — never another user's toggles.
    expect(body.userReactions).toEqual({});
  });
});

test.describe("Reaction UI — signed out", () => {
  test("does not offer reactions to anonymous visitors on a public page", async ({ page }) => {
    // PostEngagement only mounts on WordPress-backed blog detail pages, so the
    // homepage must not surface reaction controls at all.
    await page.goto("/");
    await expect(page.getByRole("button", { name: "👍" })).toHaveCount(0);
  });
});
