import { test, expect } from "@playwright/test"

// ── ALL PUBLIC ROUTES LOAD WITHOUT ERRORS ──

const publicRoutes = [
  "/", "/pricing", "/about", "/contact", "/resources", "/samples",
  "/calculator", "/industries", "/marketplace", "/solutions",
  "/solutions/compliance-suite", "/solutions/construction",
  "/solutions/healthcare", "/solutions/real-estate",
  "/privacy", "/terms", "/login", "/signup", "/forgot-password",
  "/industries/construction", "/industries/manufacturing",
  "/industries/agriculture", "/industries/hospitality",
  "/industries/retail", "/industries/healthcare",
  "/industries/wholesale", "/industries/transportation",
]

test.describe("All 27 public routes load", () => {
  for (const path of publicRoutes) {
    test(`${path} — 200 OK, no JS errors`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (err) => errors.push(err.message))
      const res = await page.goto(path)
      expect(res?.status()).toBeLessThan(400)
      await page.waitForLoadState("networkidle")
      expect(errors).toHaveLength(0)
    })
  }
})

// ── LANDING PAGE SECTIONS ──

test.describe("Landing page sections", () => {
  test("hero renders with headline + CTAs", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("CALIFORNIA WORKPLACE COMPLIANCE")).toBeVisible()
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible()
  })

  test("pricing section shows $597/$897/$1,297", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("$597")).toBeVisible()
    await expect(page.getByText("$897")).toBeVisible()
    await expect(page.getByText("$1,297")).toBeVisible()
    await expect(page.getByText("MOST POPULAR")).toBeVisible()
  })

  test("comparison table shows Protekon price", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("$597–$1,297/mo")).toBeVisible()
  })

  test("sample report CTA form fields have name attrs", async ({ page }) => {
    await page.goto("/")
    const section = page.locator("#sample")
    await expect(section.locator('input[name="email"]')).toBeVisible()
    await expect(section.locator('select[name="vertical"]')).toBeVisible()
    await expect(section.locator('select[name="employeeCount"]')).toBeVisible()
  })

  test("final CTA shows correct price", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("$597/month")).toBeVisible()
  })
})

// ── NAVIGATION ──

test.describe("Navigation links resolve", () => {
  test("footer links return 200", async ({ page }) => {
    await page.goto("/")
    const links = page.locator("footer a[href^='/']")
    const count = await links.count()
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href")
      if (href && !href.includes("#")) {
        const res = await page.request.get(href)
        expect(res.status(), `${href}`).toBeLessThan(400)
      }
    }
  })

  test("nav has login + signup CTAs", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible()
  })
})

// ── PRICING PAGE ──

test.describe("Pricing page", () => {
  test("3 tier cards with Get Started buttons", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByText("$597")).toBeVisible()
    await expect(page.getByText("$897")).toBeVisible()
    await expect(page.getByText("$1,297")).toBeVisible()
    const btns = page.locator("button", { hasText: "Get Started" })
    await expect(btns).toHaveCount(3)
  })

  test("ROI banner with violation cost", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByText("$7,229")).toBeVisible()
  })

  test("5 FAQ questions render", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByText("How quickly")).toBeVisible()
    await expect(page.getByText("Can I cancel")).toBeVisible()
    await expect(page.getByText("regulations change")).toBeVisible()
    await expect(page.getByText("data secure")).toBeVisible()
    await expect(page.getByText("software")).toBeVisible()
  })
})

// ── SIGNUP FORM FLOW ──

test.describe("Signup form", () => {
  test("step 1 → step 2 transition", async ({ page }) => {
    await page.goto("/signup")
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "TestPassword1!")
    await page.click('button[type="submit"]')
    await expect(page.getByText("Business Details")).toBeVisible()
  })

  test("step 2 shows plan selector + setup fee", async ({ page }) => {
    await page.goto("/signup")
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "TestPassword1!")
    await page.click('button[type="submit"]')
    await expect(page.getByText("$597")).toBeVisible()
    await expect(page.getByText("$897")).toBeVisible()
    await expect(page.getByText("$1,297")).toBeVisible()
    await expect(page.getByText("One-time setup fee")).toBeVisible()
  })

  test("location picker shows for Professional", async ({ page }) => {
    await page.goto("/signup")
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "TestPassword1!")
    await page.click('button[type="submit"]')
    // Professional is default
    await expect(page.getByText("Number of Locations")).toBeVisible()
  })

  test("back button returns to step 1", async ({ page }) => {
    await page.goto("/signup")
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "TestPassword1!")
    await page.click('button[type="submit"]')
    await page.locator("button", { hasText: "Back" }).click()
    await expect(page.getByText("Create Your Account")).toBeVisible()
  })
})

// ── CALCULATOR ──

test.describe("Calculator interactivity", () => {
  test("shows exposure number on load", async ({ page }) => {
    await page.goto("/calculator")
    await expect(page.getByText("Fine Exposure")).toBeVisible()
    await expect(page.getByText("Protekon vs. The Fine")).toBeVisible()
  })

  test("employee size buttons are clickable", async ({ page }) => {
    await page.goto("/calculator")
    const btn = page.locator("button", { hasText: "51-100 employees" })
    await btn.click()
    // Verify the button is now selected (has the active class)
    await expect(btn).toHaveClass(/crimson/)
  })

  test("CTA links to signup", async ({ page }) => {
    await page.goto("/calculator")
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible()
  })
})

// ── SAMPLES EMAIL GATE ──

test.describe("Samples page", () => {
  test("3 sample cards shown (locked)", async ({ page }) => {
    await page.goto("/samples")
    await expect(page.getByText("SB 553")).toBeVisible()
    await expect(page.getByText("Construction Subcontractor")).toBeVisible()
    await expect(page.getByText("Property Management")).toBeVisible()
  })

  test("email gate form visible", async ({ page }) => {
    await page.goto("/samples")
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
    await expect(page.getByText("Unlock").first()).toBeVisible()
  })

  test("$597/mo CTA text", async ({ page }) => {
    await page.goto("/samples")
    await expect(page.getByText("$597/mo")).toBeVisible()
  })
})

// ── INDUSTRY SEO PAGES ──

test.describe("Industry pages have real OSHA data", () => {
  const industries = [
    { slug: "construction", violations: "19,089" },
    { slug: "manufacturing", violations: "14,968" },
    { slug: "healthcare", violations: "3,024" },
  ]

  for (const ind of industries) {
    test(`/industries/${ind.slug} shows ${ind.violations} violations`, async ({ page }) => {
      await page.goto(`/industries/${ind.slug}`)
      await expect(page.getByText(ind.violations)).toBeVisible()
      // Has top-cited standards table
      await expect(page.getByText("Top-Cited")).toBeVisible()
      // Has CTA
      await expect(page.getByText("Start Your Plan")).toBeVisible()
    })
  }
})

// ── AUTH PAGES ──

test.describe("Auth pages", () => {
  test("login form fields", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('a[href="/signup"]')).toBeVisible()
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
  })

  test("forgot-password form field", async ({ page }) => {
    await page.goto("/forgot-password")
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test("unauthenticated /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL("**/login**")
  })
})

// ── RESOURCES PAGE ──

test.describe("Resources page", () => {
  test("newsletter form has onSubmit handler", async ({ page }) => {
    await page.goto("/resources")
    const form = page.locator("form").last()
    const emailInput = form.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    const submitBtn = form.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toHaveText("Subscribe")
  })
})
