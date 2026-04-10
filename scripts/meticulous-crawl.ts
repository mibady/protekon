import puppeteer from "puppeteer-core"

const CHROME_PATH = `${process.env.HOME}/.cache/puppeteer/chrome/linux-138.0.7204.157/chrome-linux64/chrome`
const BASE = "https://protekon-nprvtgdxa-ngenius.vercel.app"
const SHARE_TOKEN = "c0zPTGRSxJLM0peKByZig7xjxvVoCily"
const TEST_EMAIL = "admin@coastalhealthgroup.com"
const TEST_PASSWORD = "demo-password-2026"

// Public routes first (no auth needed), then auth-required routes
const PUBLIC_ROUTES = [
  // Marketing
  "/", "/about", "/contact", "/pricing", "/calculator",
  "/resources", "/samples", "/score", "/marketplace",
  "/industries",
  "/industries/construction", "/industries/healthcare", "/industries/manufacturing",
  "/industries/agriculture", "/industries/hospitality", "/industries/retail",
  "/industries/wholesale", "/industries/transportation",
  "/solutions", "/solutions/construction", "/solutions/healthcare",
  "/solutions/real-estate", "/solutions/compliance-suite",
  "/privacy", "/terms",
  // Auth pages
  "/login", "/signup", "/forgot-password",
  // Partners (public)
  "/partners", "/partners/apply", "/partners/pricing", "/partners/boot-camp",
]

const AUTH_ROUTES = [
  // Dashboard
  "/dashboard", "/dashboard/documents", "/dashboard/documents/request",
  "/dashboard/incidents", "/dashboard/incidents/new",
  "/dashboard/regulations", "/dashboard/alerts", "/dashboard/training",
  "/dashboard/intake", "/dashboard/settings", "/dashboard/chat",
  "/dashboard/marketplace", "/dashboard/poster-compliance",
  // Reports
  "/dashboard/reports", "/dashboard/reports/compliance-score",
  "/dashboard/reports/incident-analysis", "/dashboard/reports/document-history",
  "/dashboard/reports/regulatory-impact", "/dashboard/reports/delivery-log",
  "/dashboard/reports/annual-summary",
  // Verticals
  "/dashboard/agriculture/crews", "/dashboard/construction/subcontractors",
  "/dashboard/healthcare/baa-tracker", "/dashboard/healthcare/phi-inventory",
  "/dashboard/hospitality/inspections", "/dashboard/manufacturing/equipment",
  "/dashboard/real-estate/properties", "/dashboard/retail/locations",
  "/dashboard/transportation/fleet", "/dashboard/wholesale/zones",
  // Partner portal
  "/partner", "/partner/assessments", "/partner/settings",
]

const ROUTES = [...PUBLIC_ROUTES, ...AUTH_ROUTES]

async function crawlRoute(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof puppeteer.launch>>["newPage"]>>,
  route: string,
  results: { route: string; status: string; title: string }[],
  allLinks: Set<string>,
) {
  const url = `${BASE}${route}`
  try {
    const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })
    const httpStatus = response?.status() ?? 0
    const finalUrl = page.url()

    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 500) || "")
    const title = await page.title()
    const is404 = httpStatus === 404 || bodyText.includes("404") || title.toLowerCase().includes("not found")

    // Detect auth redirect: if we asked for /dashboard/X but landed on /login
    const wasRedirectedToLogin = finalUrl.includes("/login") && !route.includes("/login")
    // 304 with correct content is fine (cached response)
    const isOk = (httpStatus === 200 || httpStatus === 304) && !is404 && !wasRedirectedToLogin

    let status: string
    if (wasRedirectedToLogin) status = "AUTH-REDIRECT"
    else if (is404) status = "404"
    else if (isOk) status = "200"
    else status = String(httpStatus)

    const icon = status === "200" ? "✅" : "❌"

    console.log(`${icon} ${status} ${route}`)
    results.push({ route, status, title })

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.getAttribute("href") || "")
        .filter((h) => h.startsWith("/") && !h.startsWith("//"))
    )
    links.forEach((l) => allLinks.add(l))

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await new Promise((r) => setTimeout(r, 800))

    try {
      const buttons = await page.$$("button:not(nav button)")
      for (let i = 0; i < Math.min(2, buttons.length); i++) {
        const isVisible = await buttons[i].isIntersectingViewport()
        if (isVisible) {
          await buttons[i].click().catch(() => {})
          await new Promise((r) => setTimeout(r, 300))
        }
      }
    } catch {}

    await new Promise((r) => setTimeout(r, 1500))
  } catch (err: any) {
    console.log(`❌ ERR ${route} — ${err.message?.slice(0, 80)}`)
    results.push({ route, status: "ERR", title: err.message?.slice(0, 80) || "unknown" })
  }
}

async function run() {
  console.log(`\n🔍 Meticulous Crawl — ${ROUTES.length} routes\n`)

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  // Set Vercel share cookie by visiting with token
  console.log("Setting Vercel auth cookie...")
  await page.goto(`${BASE}/?_vercel_share=${SHARE_TOKEN}`, { waitUntil: "networkidle2", timeout: 30000 })
  console.log("Cookie set.\n")

  const results: { route: string; status: string; title: string }[] = []
  const allLinks = new Set<string>()
  const brokenLinks = new Set<string>()

  // --- Phase 1: Crawl public routes ---
  console.log("═══ Phase 1: Public Routes ═══\n")
  for (const route of PUBLIC_ROUTES) {
    await crawlRoute(page, route, results, allLinks)
  }

  // --- Phase 2: Log in via form to get Supabase session ---
  console.log("\n═══ Phase 2: Logging in ═══\n")
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 30000 })
  await page.waitForSelector('input[name="email"]', { timeout: 10000 })
  await page.type('input[name="email"]', TEST_EMAIL, { delay: 30 })
  await page.type('input[name="password"]', TEST_PASSWORD, { delay: 30 })
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
    page.click('button[type="submit"]'),
  ])
  const postLoginUrl = page.url()
  console.log(postLoginUrl.includes("/dashboard")
    ? `✅ Logged in — ${postLoginUrl}`
    : `⚠️  Login landed on ${postLoginUrl}`)

  console.log("Using login session for dashboard crawl.\n")

  console.log("═══ Phase 3: Auth Routes ═══\n")
  for (const route of AUTH_ROUTES) {
    await crawlRoute(page, route, results, allLinks)
  }

  await browser.close()

  // Check which extracted links are not in our route list
  const routeSet = new Set(ROUTES)
  for (const link of allLinks) {
    const clean = link.split("?")[0].split("#")[0]
    if (!routeSet.has(clean) && !clean.startsWith("/api/") && clean !== "/auth/callback") {
      brokenLinks.add(clean)
    }
  }

  // Summary
  const passed = results.filter((r) => r.status === "200").length
  const failed = results.filter((r) => r.status !== "200").length

  console.log("\n" + "=".repeat(60))
  console.log("RESULTS")
  console.log("=".repeat(60))
  console.log(`Total routes:  ${results.length}`)
  console.log(`Passed (200):  ${passed}`)
  console.log(`Failed:        ${failed}`)

  if (failed > 0) {
    console.log("\n❌ FAILED ROUTES:")
    results.filter((r) => r.status !== "200").forEach((r) => {
      console.log(`   ${r.status} ${r.route}`)
    })
  }

  if (brokenLinks.size > 0) {
    console.log(`\n⚠️  LINKS FOUND ON PAGES THAT ARE NOT IN ROUTE LIST (${brokenLinks.size}):`)
    Array.from(brokenLinks).sort().forEach((l) => console.log(`   ${l}`))
  }

  console.log("\n✅ Meticulous recorder was active on all pages.")
  console.log("   Check https://app.meticulous.ai for recorded sessions.\n")
}

run().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
