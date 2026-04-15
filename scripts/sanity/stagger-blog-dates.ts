/**
 * Stagger blogPost.publishedAt across weekdays (Mon–Fri) from a fixed start
 * date through a fixed end date, at a fixed publish hour in America/Los_Angeles.
 *
 * - Default mode is --dry (writes a plan report, no mutations).
 * - --apply mode commits a single transaction of patches via the Sanity mutate API.
 *
 * Usage:
 *   npx tsx scripts/sanity/stagger-blog-dates.ts            # dry (default)
 *   npx tsx scripts/sanity/stagger-blog-dates.ts --dry      # explicit dry
 *   npx tsx scripts/sanity/stagger-blog-dates.ts --apply    # commit
 *
 * Env (.env.local):
 *   SANITY_API_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID)
 *   SANITY_API_DATASET    (or NEXT_PUBLIC_SANITY_DATASET)
 *   SANITY_API_WRITE_TOKEN
 */
import { config } from "dotenv"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

config({ path: ".env.local" })

// ---------- Config ----------

// Window: 1 post per weekday, 09:00 America/Los_Angeles (UTC-08:00 PST in Nov–Mar, UTC-07:00 PDT after).
// We compute offsets explicitly so we don't depend on host TZ.
const WINDOW_START_DATE = "2025-11-01" // inclusive
const WINDOW_END_DATE = "2026-04-13" // inclusive
const PUBLISH_HOUR_LOCAL = 9 // 09:00 America/Los_Angeles

// US DST for 2025/2026:
//   PST (UTC-8): before 2026-03-08, after 2025-11-02 (window-relevant)
//   PDT (UTC-7): from 2026-03-08 onward
const DST_START = "2026-03-08" // first PDT day in window

// Tier priority: pillar > cornerstone > cluster > supporting > comparison.
// Unknown tiers fall to the end, then alphabetical by title.
const TIER_ORDER: Record<string, number> = {
  pillar: 0,
  cornerstone: 1,
  cluster: 2,
  supporting: 3,
  comparison: 4,
}

// ---------- Env ----------

const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET
const TOKEN = process.env.SANITY_API_WRITE_TOKEN

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error(
    "[stagger-blog-dates] Missing SANITY env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID/SANITY_API_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET/SANITY_API_DATASET, SANITY_API_WRITE_TOKEN.",
  )
  process.exit(1)
}

const API_VERSION = "2024-01-01"
const QUERY_API = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`
const MUTATE_API = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`

// ---------- Types ----------

interface BlogPostDoc {
  _id: string
  title?: string
  slug?: { current?: string }
  contentTier?: string
  publishedAt?: string
  keywordCluster?: string
}

interface PlanRow {
  docId: string
  title: string
  slug: string
  contentTier: string
  keywordCluster: string
  oldDate: string | null
  newDate: string
}

// ---------- Helpers ----------

function parseYmd(s: string): Date {
  // Treat as UTC midnight to avoid host TZ issues.
  const [y, m, d] = s.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function ymd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay() // 0 Sun, 6 Sat
  return dow === 0 || dow === 6
}

/** Build the list of weekday dates between start and end, inclusive. */
function buildWeekdayWindow(startYmd: string, endYmd: string): string[] {
  const start = parseYmd(startYmd)
  const end = parseYmd(endYmd)
  const out: string[] = []
  const cur = new Date(start.getTime())
  while (cur.getTime() <= end.getTime()) {
    if (!isWeekend(cur)) out.push(ymd(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return out
}

/** Step backward from WINDOW_START_DATE, adding weekdays to the FRONT until we have enough slots. */
function extendBackwardUntil(neededSlots: number, windowSlots: string[]): string[] {
  const slots = [...windowSlots]
  const earliest = parseYmd(slots[0])
  const cur = new Date(earliest.getTime())
  while (slots.length < neededSlots) {
    cur.setUTCDate(cur.getUTCDate() - 1)
    if (!isWeekend(cur)) slots.unshift(ymd(cur))
  }
  return slots
}

/** Build an ISO timestamp for a local (America/Los_Angeles) wall-clock hour on a given Y-M-D. */
function toIsoAtLaHour(dateYmd: string, localHour: number): string {
  // Determine offset: PST -08:00 before DST_START, PDT -07:00 on/after.
  const d = parseYmd(dateYmd)
  const dst = parseYmd(DST_START)
  const isPdt = d.getTime() >= dst.getTime()
  const offsetHours = isPdt ? 7 : 8
  // Local 09:00 America/LA in UTC = 09:00 + offsetHours.
  const utcHour = localHour + offsetHours
  const hh = String(utcHour).padStart(2, "0")
  return `${dateYmd}T${hh}:00:00.000Z`
}

function tierRank(tier: string | undefined): number {
  if (!tier) return 999
  return TIER_ORDER[tier] ?? 999
}

// ---------- Sanity I/O ----------

async function fetchAllBlogPosts(): Promise<BlogPostDoc[]> {
  const groq = `*[_type == "blogPost"]{ _id, title, slug, contentTier, publishedAt, keywordCluster }`
  const url = `${QUERY_API}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Sanity query failed: ${res.status} ${body}`)
  }
  const json = (await res.json()) as { result: BlogPostDoc[] }
  return json.result ?? []
}

interface Patch {
  patch: { id: string; set: { publishedAt: string } }
}

async function commitTransaction(patches: Patch[]): Promise<void> {
  const res = await fetch(MUTATE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations: patches }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Sanity mutate failed: ${res.status} ${body}`)
  }
  const json = (await res.json()) as { transactionId?: string; results?: unknown[] }
  console.log(
    `[stagger-blog-dates] transaction committed: id=${json.transactionId ?? "?"} results=${
      json.results?.length ?? 0
    }`,
  )
}

// ---------- Main ----------

async function main() {
  const args = new Set(process.argv.slice(2))
  const apply = args.has("--apply")
  const mode = apply ? "APPLY" : "DRY"
  console.log(
    `[stagger-blog-dates] mode=${mode} project=${PROJECT_ID} dataset=${DATASET}`,
  )

  const posts = await fetchAllBlogPosts()
  console.log(`[stagger-blog-dates] fetched ${posts.length} blogPost docs`)
  if (posts.length === 0) {
    console.log("[stagger-blog-dates] nothing to do.")
    return
  }

  // Sort: tier rank asc, then alphabetical title asc (case-insensitive).
  const sorted = [...posts].sort((a, b) => {
    const ra = tierRank(a.contentTier)
    const rb = tierRank(b.contentTier)
    if (ra !== rb) return ra - rb
    const ta = (a.title ?? "").toLowerCase()
    const tb = (b.title ?? "").toLowerCase()
    if (ta < tb) return -1
    if (ta > tb) return 1
    return 0
  })

  // Build weekday slots, extending backward if needed.
  let slots = buildWeekdayWindow(WINDOW_START_DATE, WINDOW_END_DATE)
  if (slots.length < sorted.length) {
    console.log(
      `[stagger-blog-dates] window has ${slots.length} weekdays but ${sorted.length} posts — extending backward.`,
    )
    slots = extendBackwardUntil(sorted.length, slots)
  }

  // Assign 1 post per weekday in sorted order. Only use the first N slots
  // (keeping the newest end boundary fixed, earliest slot first).
  const planRows: PlanRow[] = sorted.map((doc, i) => {
    const slotYmd = slots[i]
    const newIso = toIsoAtLaHour(slotYmd, PUBLISH_HOUR_LOCAL)
    return {
      docId: doc._id,
      title: doc.title ?? "(untitled)",
      slug: doc.slug?.current ?? "",
      contentTier: doc.contentTier ?? "",
      keywordCluster: doc.keywordCluster ?? "",
      oldDate: doc.publishedAt ?? null,
      newDate: newIso,
    }
  })

  const firstDate = planRows[0]?.newDate ?? ""
  const lastDate = planRows[planRows.length - 1]?.newDate ?? ""
  console.log(
    `[stagger-blog-dates] plan: ${planRows.length} posts, first=${firstDate} last=${lastDate}`,
  )

  // Write report.
  const todayYmd = new Date().toISOString().slice(0, 10)
  const reportsDir = join(process.cwd(), "reports")
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true })
  const reportPath = join(reportsDir, `sanity-blog-dates-${todayYmd}.json`)
  const reportPayload = {
    generatedAt: new Date().toISOString(),
    mode,
    project: PROJECT_ID,
    dataset: DATASET,
    windowStart: WINDOW_START_DATE,
    windowEnd: WINDOW_END_DATE,
    publishHourLocal: PUBLISH_HOUR_LOCAL,
    timezone: "America/Los_Angeles",
    totalPosts: planRows.length,
    firstSlot: firstDate,
    lastSlot: lastDate,
    rows: planRows,
  }
  writeFileSync(reportPath, JSON.stringify(reportPayload, null, 2))
  console.log(`[stagger-blog-dates] wrote report: ${reportPath}`)

  if (!apply) {
    console.log("[stagger-blog-dates] DRY mode — no mutations sent. Re-run with --apply to commit.")
    return
  }

  // Apply: one transaction with all patches.
  const patches: Patch[] = planRows.map((row) => ({
    patch: { id: row.docId, set: { publishedAt: row.newDate } },
  }))
  console.log(`[stagger-blog-dates] committing ${patches.length} patches in a single transaction…`)
  await commitTransaction(patches)
  console.log("[stagger-blog-dates] done.")
}

main().catch((err) => {
  console.error("[stagger-blog-dates] failed:", err)
  process.exit(1)
})
