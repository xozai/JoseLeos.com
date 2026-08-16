import { test, expect } from "@playwright/test";

/**
 * GET /api/og renders the social share card with @vercel/og. It reads only
 * query params and SITE_URL, so it needs no WordPress, KV, or Postgres — these
 * assert it renders a real image instead of crashing on odd input.
 */

const OG_TIMEOUT = 30_000; // first edge-runtime render compiles the route

test.describe("GET /api/og", () => {
  test("renders a PNG with no params at all", async ({ request }) => {
    const res = await request.get("/api/og", { timeout: OG_TIMEOUT });

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    expect((await res.body()).byteLength).toBeGreaterThan(1000);
  });

  test("renders a titled card", async ({ request }) => {
    const res = await request.get("/api/og?title=Hello%20World", { timeout: OG_TIMEOUT });

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("renders a review card with a rating", async ({ request }) => {
    // type=review takes the renderStars() branch, which parses `rating`.
    const res = await request.get("/api/og?type=review&title=Some%20Place&rating=8.5", {
      timeout: OG_TIMEOUT,
    });

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("survives a non-numeric rating", async ({ request }) => {
    const res = await request.get("/api/og?type=review&title=Bad%20Rating&rating=abc", {
      timeout: OG_TIMEOUT,
    });

    expect(res.status()).toBe(200);
  });

  test("survives an unparseable date", async ({ request }) => {
    // formatOgDate() is wrapped in try/catch but `new Date("nonsense")` yields
    // an Invalid Date rather than throwing — the card must still render.
    const res = await request.get("/api/og?title=Bad%20Date&date=nonsense", {
      timeout: OG_TIMEOUT,
    });

    expect(res.status()).toBe(200);
  });

  test("renders the full descriptor line", async ({ request }) => {
    const res = await request.get(
      "/api/og?title=Full%20Card&category=Engineering&readingTime=5%20min%20read&date=2026-01-15",
      { timeout: OG_TIMEOUT }
    );

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("handles a very long title without erroring", async ({ request }) => {
    // Title length drives the font-size ternary; the >50 char branch is the
    // one that never gets hit by the short fixtures above.
    const longTitle = encodeURIComponent("A".repeat(140));
    const res = await request.get(`/api/og?title=${longTitle}`, { timeout: OG_TIMEOUT });

    expect(res.status()).toBe(200);
  });
});
