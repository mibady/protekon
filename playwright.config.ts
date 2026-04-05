import { defineConfig, devices } from "@playwright/test"
import { loadEnvConfig } from "@next/env"

// Load .env.local so auth setup has Supabase keys
loadEnvConfig(process.cwd())

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Setup: authenticate and save session
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // Public pages: no auth needed
    {
      name: "public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /public-pages\.spec|^forms\.spec|partner-pages\.spec|score-wizard\.spec|public-forms\.spec|navigation-links\.spec/,
    },
    // Auth tests: test the login/signup flow itself
    {
      name: "auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /auth\.spec\.ts/,
    },
    // Dashboard: requires authenticated session
    {
      name: "dashboard",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      testMatch: /dashboard.*\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
