import { defineConfig, devices } from "@playwright/test"
import { loadEnvConfig } from "@next/env"

// Load .env.local so auth setup has Supabase keys
loadEnvConfig(process.cwd())

// When BASE_URL points at a remote deployment (e.g., https://www.protekon.org),
// don't try to start a local dev server — the journey-cron job runs against
// prod. webServer config only applies when running against localhost.
const baseUrl = process.env.BASE_URL || "http://localhost:3000"
const isRemote = /^https?:\/\//.test(baseUrl) && !baseUrl.includes("localhost")

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: baseUrl,
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
    // Onboarding wizard: injects its own cookies per-test (varies vertical)
    {
      name: "onboarding",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /onboarding-wizard\.spec\.ts/,
    },
    // Customer journey: no mocks, hits live Stripe/Supabase/Resend/Inngest.
    // Always runs against BASE_URL — designed for nightly cron vs prod.
    {
      name: "journey",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /customer-journey\.spec\.ts/,
    },
  ],
  webServer: isRemote
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
})
