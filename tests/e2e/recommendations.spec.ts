import { test, expect } from "@playwright/test";

test.describe("Recommendations listing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recommendations");
  });

  test("renders the heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Recommendations/i, level: 1 })).toBeVisible();
  });

  test("shows category filter tabs including 'All'", async ({ page }) => {
    await expect(page.getByRole("link", { name: /^All$/i })).toBeVisible();
  });

  test("has grid and list view toggle buttons", async ({ page }) => {
    await expect(page.getByTitle("Grid view")).toBeVisible();
    await expect(page.getByTitle("List view")).toBeVisible();
  });

  test("switching to list view adds ?view=list to URL", async ({ page }) => {
    await page.getByTitle("List view").click();
    await expect(page).toHaveURL(/view=list/);
  });

  test("switching back to grid view removes view param", async ({ page }) => {
    await page.goto("/recommendations?view=list");
    await page.getByTitle("Grid view").click();
    await expect(page).not.toHaveURL(/view=list/);
  });

  test("category filter updates URL search param", async ({ page }) => {
    // Click the first non-All category tab if there are multiple
    const tabs = page.locator("a").filter({ hasText: /^(Books|Tech|Music|Software|Travel|Services|Restaurants)$/i });
    const count = await tabs.count();
    if (count > 0) {
      const firstTab = tabs.first();
      const label = await firstTab.textContent();
      await firstTab.click();
      await expect(page).toHaveURL(new RegExp(`category=${encodeURIComponent(label?.trim() ?? "")}`));
    }
  });

  test("has link to recommendations RSS feed in head", async ({ page }) => {
    const rss = page.locator('link[type="application/rss+xml"]');
    await expect(rss).toHaveAttribute("href", /recommendations\/feed\.xml/);
  });
});

test.describe("Recommendations detail page", () => {
  test("renders correctly when visiting a mocked review", async ({ page }) => {
    // We mock the WP GraphQL call to return a fake recommendation
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";

      if (body.includes("GetRecommendationBySlug")) {
        await route.fulfill({
          json: {
            data: {
              recommendation: {
                slug: "test-book",
                title: "A Great Book",
                excerpt: "A short description.",
                date: "2026-01-01T00:00:00",
                content: "<p>Full review content here.</p>",
                featuredImage: null,
                recFields: {
                  itemUrl: "https://example.com",
                  shortDescription: "Short desc",
                  affiliateLink: null,
                  category: "Books",
                  subcategory: "Fiction",
                  rating: 9,
                  priceRange: "$$",
                  verdict: "One of the best books I have read.",
                  featured: false,
                  lastReviewed: "2026-01-15",
                  websiteUrl: "https://example.com",
                  purchaseUrl: "https://amazon.com/example",
                  pros: ["Well written", "Engaging story"],
                  cons: ["Slow start"],
                  itemImage: null,
                },
                categories: { nodes: [{ name: "Books", slug: "books" }] },
                acfVisibility: { visibility: "public" },
              },
            },
          },
        });
      } else if (body.includes("GetAllRecommendationSlugs")) {
        await route.fulfill({ json: { data: { recommendations: { nodes: [{ slug: "test-book", modified: null }] } } } });
      } else if (body.includes("GetAllRecommendations")) {
        await route.fulfill({ json: { data: { recommendations: { nodes: [] } } } });
      } else {
        await route.continue();
      }
    });

    await page.goto("/recommendations/test-book");

    await expect(page.getByRole("heading", { name: "A Great Book", level: 1 })).toBeVisible();
    await expect(page.locator("text=Books")).toBeVisible();
    await expect(page.locator("text=Fiction")).toBeVisible();
    await expect(page.locator("text=One of the best books I have read.")).toBeVisible();
  });

  test("shows pros and cons sections when present", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetRecommendationBySlug")) {
        await route.fulfill({
          json: {
            data: {
              recommendation: {
                slug: "test-item",
                title: "Test Item",
                excerpt: "",
                date: "2026-01-01T00:00:00",
                content: null,
                featuredImage: null,
                recFields: {
                  itemUrl: "",
                  shortDescription: "",
                  affiliateLink: null,
                  category: "Tech",
                  subcategory: null,
                  rating: 8,
                  priceRange: "$$$",
                  verdict: null,
                  featured: false,
                  lastReviewed: null,
                  websiteUrl: null,
                  purchaseUrl: "https://example.com",
                  pros: ["Fast", "Reliable"],
                  cons: ["Expensive"],
                  itemImage: null,
                },
                categories: null,
                acfVisibility: { visibility: "public" },
              },
            },
          },
        });
      } else if (body.includes("GetAllRecommendationSlugs")) {
        await route.fulfill({ json: { data: { recommendations: { nodes: [{ slug: "test-item", modified: null }] } } } });
      } else if (body.includes("GetAllRecommendations")) {
        await route.fulfill({ json: { data: { recommendations: { nodes: [] } } } });
      } else {
        await route.continue();
      }
    });

    await page.goto("/recommendations/test-item");

    await expect(page.getByRole("heading", { name: /Pros.*Cons/i })).toBeVisible();
    await expect(page.locator("text=Fast")).toBeVisible();
    await expect(page.locator("text=Expensive")).toBeVisible();
  });

  test("back link navigates to /recommendations", async ({ page }) => {
    await page.goto("/recommendations");
    // Only proceed if there's at least one recommendation card with a "See Review" link
    const reviewLinks = page.getByRole("link", { name: /See Review/i });
    if (await reviewLinks.count() > 0) {
      await reviewLinks.first().click();
      await expect(page.getByRole("link", { name: /Back to Recommendations/i })).toBeVisible();
      await page.getByRole("link", { name: /Back to Recommendations/i }).click();
      await expect(page).toHaveURL(/\/recommendations$/);
    }
  });
});

test.describe("Recommendations RSS feed", () => {
  test("returns valid XML with correct content-type", async ({ request }) => {
    const res = await request.get("/recommendations/feed.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/xml/);
    const body = await res.text();
    expect(body).toContain("<rss");
    expect(body).toContain("Jose Leos — Recommendations");
  });
});
