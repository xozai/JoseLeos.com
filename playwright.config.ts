import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    // `npm run dev` serves on 4000 (next dev -p 4000).
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  // Start the dev server automatically when running locally
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:4000",
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          // NextAuth refuses to start without a secret, and proxy.ts wraps every
          // gated route in auth() — without this the route-protection tests get
          // a 500 instead of the redirect. Signing-only; no backend is contacted.
          AUTH_SECRET:
            process.env.AUTH_SECRET ?? "e2e-test-secret-not-for-production",
          AUTH_URL: process.env.AUTH_URL ?? "http://localhost:4000",
        },
      },
});
