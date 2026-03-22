import { test, expect } from "@playwright/test";

test.describe("Blog listing pagination", () => {
  test("renders the blog heading", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /^Blog$/i, level: 1 })).toBeVisible();
  });

  test("shows older-posts link when hasNextPage (mocked)", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPosts")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: true, endCursor: "cursor123" },
                nodes: [
                  {
                    slug: "sample-post",
                    title: "Sample Post",
                    excerpt: "An excerpt.",
                    date: "2026-01-01T00:00:00",
                    categories: { nodes: [{ name: "Dev", slug: "dev" }] },
                    featuredImage: null,
                    acfVisibility: { visibility: "public" },
                  },
                ],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/blog");
    await expect(page.getByRole("link", { name: /Older posts/i })).toBeVisible();
  });

  test("?after param shows newer-posts link", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPosts")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    slug: "older-post",
                    title: "Older Post",
                    excerpt: "",
                    date: "2025-06-01T00:00:00",
                    categories: { nodes: [] },
                    featuredImage: null,
                    acfVisibility: { visibility: "public" },
                  },
                ],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/blog?after=cursor123");
    await expect(page.getByRole("link", { name: /Newer posts/i })).toBeVisible();
  });
});

test.describe("Blog category page", () => {
  test("renders category heading and posts", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPostsByCategoryPaginated")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    slug: "dev-post",
                    title: "Dev Post Title",
                    excerpt: "Post excerpt.",
                    date: "2026-01-10T00:00:00",
                    categories: { nodes: [{ name: "Development", slug: "development" }] },
                    featuredImage: null,
                    acfVisibility: { visibility: "public" },
                  },
                ],
              },
            },
          },
        });
      } else if (body.includes("GetAllCategorySlugs")) {
        await route.fulfill({
          json: {
            data: {
              categories: {
                nodes: [{ slug: "development", name: "Development", count: 1 }],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/blog/category/development");

    await expect(page.getByRole("heading", { name: /Development/i, level: 1 })).toBeVisible();
    await expect(page.getByText("Dev Post Title")).toBeVisible();
  });

  test("back to blog link is present", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPostsByCategoryPaginated")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    slug: "tech-post",
                    title: "Tech Post",
                    excerpt: "",
                    date: "2026-01-01T00:00:00",
                    categories: { nodes: [{ name: "Tech", slug: "tech" }] },
                    featuredImage: null,
                    acfVisibility: { visibility: "public" },
                  },
                ],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/blog/category/tech");
    await expect(page.getByRole("link", { name: /Back to Blog/i })).toBeVisible();
  });
});

test.describe("Blog tag page", () => {
  test("renders tag heading with hash prefix", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPostsByTag")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    slug: "tagged-post",
                    title: "Tagged Post",
                    excerpt: "",
                    date: "2026-02-01T00:00:00",
                    categories: { nodes: [] },
                    tags: { nodes: [{ name: "Typescript", slug: "typescript" }] },
                    featuredImage: null,
                    acfVisibility: { visibility: "public" },
                  },
                ],
              },
            },
          },
        });
      } else if (body.includes("GetAllTagSlugs")) {
        await route.fulfill({
          json: {
            data: {
              tags: {
                nodes: [{ slug: "typescript", name: "Typescript", count: 1 }],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/blog/tag/typescript");

    await expect(page.getByRole("heading", { name: /#Typescript/i, level: 1 })).toBeVisible();
    await expect(page.getByText("Tagged Post")).toBeVisible();
  });
});

test.describe("Newsletter archive page", () => {
  test("renders newsletter heading and subscribe button", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPostsByCategoryPaginated")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/newsletter");
    await expect(page.getByRole("heading", { name: /Archive/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Subscribe/i })).toBeVisible();
  });

  test("shows empty state when no issues", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPostsByCategoryPaginated")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/newsletter");
    await expect(page.getByText(/No issues published yet/i)).toBeVisible();
  });

  test("shows past issues when available", async ({ page }) => {
    await page.route("**/graphql", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("GetPostsByCategoryPaginated")) {
        await route.fulfill({
          json: {
            data: {
              posts: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    slug: "issue-1",
                    title: "Issue #1: Getting Started",
                    excerpt: "Welcome to the newsletter.",
                    date: "2026-01-01T00:00:00",
                    categories: { nodes: [{ name: "Newsletter", slug: "newsletter" }] },
                    featuredImage: null,
                    acfVisibility: { visibility: "public" },
                  },
                ],
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/newsletter");
    await expect(page.getByText("Issue #1: Getting Started")).toBeVisible();
  });
});

test.describe("Booking page", () => {
  test("renders the booking heading", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.getByRole("heading", { name: /Book a Meeting/i, level: 1 })).toBeVisible();
  });
});
