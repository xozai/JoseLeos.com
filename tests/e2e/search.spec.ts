import { test, expect } from "@playwright/test";

test.describe("Search overlay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens with Ctrl+K keyboard shortcut", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByPlaceholder(/Search posts and projects/i)).toBeVisible();
  });

  test("opens when the search trigger button is clicked", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    await expect(page.getByPlaceholder(/Search posts and projects/i)).toBeVisible();
  });

  test("closes with Escape key", async ({ page }) => {
    await page.keyboard.press("Control+k");
    const input = page.getByPlaceholder(/Search posts and projects/i);
    await expect(input).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(input).not.toBeVisible();
  });

  test("closes when clicking the backdrop", async ({ page }) => {
    await page.keyboard.press("Control+k");
    const input = page.getByPlaceholder(/Search posts and projects/i);
    await expect(input).toBeVisible();
    // Click outside the search modal
    await page.mouse.click(10, 10);
    await expect(input).not.toBeVisible();
  });

  test("shows 'type at least 2 characters' hint when empty", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator("text=/at least 2 characters/i")).toBeVisible();
  });

  test("shows 'no results' for a nonsense query", async ({ page }) => {
    // Mock the WP search endpoint to return an empty array
    await page.route("**/wp-json/wp/v2/search**", (route) =>
      route.fulfill({ json: [] })
    );
    await page.keyboard.press("Control+k");
    await page.getByPlaceholder(/Search posts and projects/i).fill("xyzzy1234nonsense");
    await expect(page.locator("text=/No results for/i")).toBeVisible({ timeout: 3000 });
  });

  test("displays search results when found", async ({ page }) => {
    await page.route("**/wp-json/wp/v2/search**", (route) =>
      route.fulfill({
        json: [
          { id: 1, title: "Test Post Title", url: "http://cms.example.com/test-post-title/", type: "post", subtype: "post" },
          { id: 2, title: "Test Project", url: "http://cms.example.com/test-project/", type: "post", subtype: "portfolio_project" },
        ],
      })
    );
    await page.keyboard.press("Control+k");
    await page.getByPlaceholder(/Search posts and projects/i).fill("test");
    await expect(page.locator("text=Test Post Title")).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=Test Project")).toBeVisible();
  });
});
