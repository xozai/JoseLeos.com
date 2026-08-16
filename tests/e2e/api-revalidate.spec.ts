import { test, expect } from "@playwright/test";

/**
 * Route-level contract for POST /api/revalidate (on-demand ISR purge).
 *
 * This is the one API route with no external dependency at all — it compares a
 * query param against ISR_REVALIDATE_SECRET and calls revalidatePath(). The
 * rejection paths are therefore fully deterministic everywhere.
 *
 * The accept path needs the server's secret, which the test process only knows
 * when ISR_REVALIDATE_SECRET is exported for both; it skips otherwise.
 */

test.describe("POST /api/revalidate — secret gate", () => {
  test("rejects a request with no secret", async ({ request }) => {
    const res = await request.post("/api/revalidate", {
      data: { postType: "post", slug: "hello-world" },
    });

    expect(res.status()).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  test("rejects a wrong secret", async ({ request }) => {
    const res = await request.post("/api/revalidate?secret=definitely-not-the-secret", {
      data: { postType: "post", slug: "hello-world" },
    });

    expect(res.status()).toBe(401);
  });

  test("rejects an empty secret", async ({ request }) => {
    // Guards against an unset ISR_REVALIDATE_SECRET being satisfiable by a
    // blank param — `null`/`""` must never compare equal to `undefined`.
    const res = await request.post("/api/revalidate?secret=", {
      data: { postType: "post", slug: "hello-world" },
    });

    expect(res.status()).toBe(401);
  });

  test("checks the secret before reading the body", async ({ request }) => {
    // Unparseable body + no secret must still be 401, not 400: an unauthorised
    // caller should learn nothing about body handling.
    const res = await request.post("/api/revalidate", {
      headers: { "Content-Type": "application/json" },
      data: "not json at all",
    });

    expect(res.status()).toBe(401);
  });

  test("does not expose GET", async ({ request }) => {
    const res = await request.get("/api/revalidate");
    expect(res.status()).toBe(405);
  });
});

test.describe("POST /api/revalidate — with the correct secret", () => {
  const SECRET = process.env.ISR_REVALIDATE_SECRET;

  test("purges a blog post path", async ({ request }) => {
    test.skip(
      !SECRET,
      "ISR_REVALIDATE_SECRET is not exported to the test process — cannot exercise the accept path"
    );

    const res = await request.post(`/api/revalidate?secret=${encodeURIComponent(SECRET!)}`, {
      data: { postType: "post", slug: "hello-world" },
    });

    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ revalidated: true });
  });

  test("rejects an unparseable body with 400", async ({ request }) => {
    test.skip(
      !SECRET,
      "ISR_REVALIDATE_SECRET is not exported to the test process — cannot exercise the accept path"
    );

    const res = await request.post(`/api/revalidate?secret=${encodeURIComponent(SECRET!)}`, {
      headers: { "Content-Type": "application/json" },
      data: "not json at all",
    });

    expect(res.status()).toBe(400);
  });
});
