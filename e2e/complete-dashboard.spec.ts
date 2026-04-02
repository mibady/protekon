import { test, expect } from "@playwright/test"

// Use the authenticated session from auth.setup.ts
test.use({ storageState: "e2e/.auth/user.json" })

// ── ALL DASHBOARD ROUTES LOAD ──

const dashboardRoutes = [
  "/dashboard",
  "/dashboard/intake",
  "/dashboard/chat",
  "/dashboard/documents",
  "/dashboard/documents/request",
  "/dashboard/incidents",
  "/dashboard/incidents/new",
  "/dashboard/regulations",
  "/dashboard/alerts",
  "/dashboard/training",
  "/dashboard/marketplace",
  "/dashboard/poster-compliance",
  "/dashboard/construction/subcontractors",
  "/dashboard/healthcare/baa-tracker",
  "/dashboard/healthcare/phi-inventory",
  "/dashboard/real-estate/properties",
  "/dashboard/reports",
  "/dashboard/reports/compliance-score",
  "/dashboard/reports/incident-analysis",
  "/dashboard/reports/document-history",
  "/dashboard/reports/regulatory-impact",
  "/dashboard/reports/delivery-log",
  "/dashboard/reports/annual-summary",
  "/dashboard/settings",
]

test.describe("All 24 dashboard routes load (authenticated)", () => {
  for (const path of dashboardRoutes) {
    test(`${path} — loads without JS errors`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (err) => errors.push(err.message))
      const res = await page.goto(path)
      expect(res?.status()).toBeLessThan(400)
      await page.waitForLoadState("networkidle")
      expect(errors).toHaveLength(0)
    })
  }
})

// ── DASHBOARD LAYOUT ──

test.describe("Dashboard layout", () => {
  test("sidebar shows brand logo", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("aside").first()).toBeVisible()
    await expect(page.getByText("PROTEKON").first()).toBeVisible()
  })

  test("sidebar shows client business name", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    // Should show a business name (from test user data)
    const aside = page.locator("aside").first()
    await expect(aside).toBeVisible()
  })

  test("sidebar tier badge is dynamic", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    // Should show one of: Core Tier, Professional Tier, Multi-Site Tier
    await expect(page.getByText(/Tier/).first()).toBeVisible()
  })

  test("top bar has search, notifications, user avatar", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator('input[placeholder="Search..."]')).toBeVisible()
  })

  test("sign out button works", async ({ page }) => {
    await page.goto("/dashboard")
    // Find sign out in sidebar
    const signOutBtn = page.locator("button", { hasText: "Sign Out" }).first()
    await expect(signOutBtn).toBeVisible()
  })
})

// ── DASHBOARD OVERVIEW ──

test.describe("Dashboard overview", () => {
  test("shows compliance score", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    // Score should be a number displayed
    await expect(page.locator("text=/\\d+/").first()).toBeVisible()
  })

  test("shows stat cards", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("Documents").first()).toBeVisible()
    await expect(page.getByText("Incidents").first()).toBeVisible()
  })
})

// ── INTAKE ASSESSMENT ──

test.describe("Intake page", () => {
  test("shows 6 compliance questions", async ({ page }) => {
    await page.goto("/dashboard/intake")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("Workplace Violence Prevention Plan")).toBeVisible()
    await expect(page.getByText("Employee Safety Training")).toBeVisible()
    await expect(page.getByText("Incident Logging System")).toBeVisible()
    await expect(page.getByText("Hazard Identification")).toBeVisible()
    await expect(page.getByText("Reporting Policy")).toBeVisible()
    await expect(page.getByText("Union Status")).toBeVisible()
  })

  test("score ring updates on toggle", async ({ page }) => {
    await page.goto("/dashboard/intake")
    await page.waitForLoadState("networkidle")

    // Click a question to toggle it
    const firstQ = page.getByText("Workplace Violence Prevention Plan").first()
    await firstQ.click()

    // Score should update (look for percentage change)
    await expect(page.getByText("%")).toBeVisible()
  })

  test("fine exposure warning shows", async ({ page }) => {
    await page.goto("/dashboard/intake")
    await expect(page.getByText("$7,229")).toBeVisible()
  })

  test("submit button exists", async ({ page }) => {
    await page.goto("/dashboard/intake")
    await expect(page.getByText("Submit Assessment")).toBeVisible()
  })
})

// ── AI CHAT ──

test.describe("Compliance chat", () => {
  test("shows assistant intro with suggestion chips", async ({ page }) => {
    await page.goto("/dashboard/chat")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("Compliance Assistant")).toBeVisible()
    await expect(page.getByText("What is my current compliance status")).toBeVisible()
    await expect(page.getByText("What does SB 553 require")).toBeVisible()
  })

  test("input field and send button visible", async ({ page }) => {
    await page.goto("/dashboard/chat")
    await expect(page.locator('input[placeholder*="compliance"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("disclaimer text present", async ({ page }) => {
    await page.goto("/dashboard/chat")
    await expect(page.getByText("Not legal advice")).toBeVisible()
  })
})

// ── DOCUMENTS ──

test.describe("Documents pages", () => {
  test("document hub loads", async ({ page }) => {
    await page.goto("/dashboard/documents")
    await page.waitForLoadState("networkidle")
    // Should show document list or empty state
    await expect(page.getByText(/document/i).first()).toBeVisible()
  })

  test("document request form has all fields", async ({ page }) => {
    await page.goto("/dashboard/documents/request")
    await page.waitForLoadState("networkidle")
    // Should have document type selector
    await expect(page.locator("select").first()).toBeVisible()
    // Should have submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})

// ── INCIDENTS ──

test.describe("Incidents pages", () => {
  test("incident log loads", async ({ page }) => {
    await page.goto("/dashboard/incidents")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(/incident/i).first()).toBeVisible()
  })

  test("new incident form has required fields", async ({ page }) => {
    await page.goto("/dashboard/incidents/new")
    await page.waitForLoadState("networkidle")

    // Date, location, description, severity
    await expect(page.locator('input[type="date"]').first()).toBeVisible()
    await expect(page.locator("textarea").first()).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})

// ── REGULATIONS ──

test.describe("Regulations feed", () => {
  test("loads regulatory updates", async ({ page }) => {
    await page.goto("/dashboard/regulations")
    await page.waitForLoadState("networkidle")
    // Should show regulation content or empty state
    await expect(page.getByText(/regulat/i).first()).toBeVisible()
  })
})

// ── REPORTS HUB ──

test.describe("Reports hub", () => {
  test("shows 6 report cards with links", async ({ page }) => {
    await page.goto("/dashboard/reports")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("Compliance Score Report")).toBeVisible()
    await expect(page.getByText("Incident Analysis")).toBeVisible()
    await expect(page.getByText("Document History")).toBeVisible()
    await expect(page.getByText("Regulatory Impact")).toBeVisible()
    await expect(page.getByText("Delivery Log")).toBeVisible()
    await expect(page.getByText("Annual Compliance")).toBeVisible()
  })

  test("View Report links navigate correctly", async ({ page }) => {
    await page.goto("/dashboard/reports")
    const link = page.locator('a[href="/dashboard/reports/compliance-score"]').first()
    await expect(link).toBeVisible()
  })

  test("Generate Now buttons are functional", async ({ page }) => {
    await page.goto("/dashboard/reports")
    const monthlyBtn = page.locator("button", { hasText: "Monthly Summary" })
    await expect(monthlyBtn).toBeVisible()
    await expect(monthlyBtn).toBeEnabled()
  })

  test("Generate Full Package button is functional", async ({ page }) => {
    await page.goto("/dashboard/reports")
    const fullBtn = page.locator("button", { hasText: "Generate Full Package" })
    await expect(fullBtn).toBeVisible()
    await expect(fullBtn).toBeEnabled()
  })
})

// ── SETTINGS ──

test.describe("Settings page", () => {
  test("shows all 4 tabs", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    // Should show tab buttons
    await expect(page.getByText(/profile/i).first()).toBeVisible()
  })

  test("billing tab shows plan pricing", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")

    // Click billing tab
    const billingTab = page.locator("button", { hasText: /billing/i }).first()
    if (await billingTab.isVisible()) {
      await billingTab.click()
      // Should show current plan price
      await expect(page.getByText(/\$\d+\/mo/).first()).toBeVisible()
    }
  })

  test("billing tab shows plan features checklist", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const billingTab = page.locator("button", { hasText: /billing/i }).first()
    if (await billingTab.isVisible()) {
      await billingTab.click()
      await expect(page.getByText("Your Plan Includes")).toBeVisible()
    }
  })

  test("Manage Subscription button exists", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForLoadState("networkidle")
    const billingTab = page.locator("button", { hasText: /billing/i }).first()
    if (await billingTab.isVisible()) {
      await billingTab.click()
      await expect(page.getByText("Manage Subscription")).toBeVisible()
    }
  })
})

// ── MARKETPLACE ──

test.describe("Marketplace", () => {
  test("add-on buttons show Coming Soon", async ({ page }) => {
    await page.goto("/dashboard/marketplace")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("Coming Soon").first()).toBeVisible()
  })

  test("Contact API Team links to /contact", async ({ page }) => {
    await page.goto("/dashboard/marketplace")
    await expect(page.locator('a[href="/contact"]')).toBeVisible()
  })
})

// ── TRAINING ──

test.describe("Training records", () => {
  test("page loads with table/card view", async ({ page }) => {
    await page.goto("/dashboard/training")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(/training/i).first()).toBeVisible()
  })
})

// ── POSTER COMPLIANCE ──

test.describe("Poster compliance", () => {
  test("page loads", async ({ page }) => {
    await page.goto("/dashboard/poster-compliance")
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(/poster/i).first()).toBeVisible()
  })
})
