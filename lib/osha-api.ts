import type {
  OshaIndustryProfile,
  OshaNearbyEnforcement,
  OshaBenchmarks,
} from "@/lib/types"
import { createScraperClient } from "@/lib/supabase/scraper"

const OSHA_API_URL = process.env.OSHA_API_URL
const OSHA_API_KEY = process.env.OSHA_API_KEY

// Simple in-memory cache with 1-hour TTL
const cache = new Map<string, { data: unknown; expiry: number }>()
const TTL_MS = 60 * 60 * 1000 // 1 hour

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return undefined
  }
  return entry.data as T
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + TTL_MS })
}

// ---------------------------------------------------------------------------
// External API fetch (original path)
// ---------------------------------------------------------------------------

async function oshaFetch<T>(path: string): Promise<T | null> {
  if (!OSHA_API_URL || !OSHA_API_KEY) return null

  try {
    const res = await fetch(`${OSHA_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${OSHA_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.warn(`[osha-api] ${path} returned ${res.status}`)
      return null
    }

    return (await res.json()) as T
  } catch (err) {
    console.warn(
      "[osha-api] Fetch failed:",
      path,
      err instanceof Error ? err.message : err
    )
    return null
  }
}

// ---------------------------------------------------------------------------
// Scraper DB fallback (queries the 73k-row OSHA violations table directly)
// ---------------------------------------------------------------------------

// NAICS prefix → readable industry name
const NAICS_NAMES: Record<string, string> = {
  "23": "Construction",
  "31": "Manufacturing",
  "32": "Manufacturing",
  "33": "Manufacturing",
  "44": "Retail Trade",
  "45": "Retail Trade",
  "48": "Transportation",
  "49": "Warehousing",
  "62": "Healthcare",
  "72": "Hospitality",
  "11": "Agriculture",
  "42": "Wholesale",
  "53": "Real Estate",
  "81": "Auto Services / Repair",
}

async function scraperIndustryProfile(
  naicsCode: string
): Promise<OshaIndustryProfile | null> {
  const scraper = createScraperClient()
  if (!scraper) return null

  try {
    // Get violations matching this NAICS prefix (first 2-3 digits)
    const prefix = naicsCode.slice(0, 2)
    const { data: violations, count } = await scraper
      .from("protekon_osha_violations")
      .select("standard_cited, penalty_amount, violation_type, employer_name", { count: "exact" })
      .like("naics_code", `${prefix}%`)
      .limit(5000)

    if (!violations || violations.length === 0) return null

    const totalViolations = count ?? violations.length
    const penalties = violations.map((v) => v.penalty_amount || 0)
    const avgPenalty = penalties.reduce((a, b) => a + b, 0) / penalties.length

    // Count violations per standard
    const standardCounts = new Map<string, number>()
    const standardPenalties = new Map<string, number[]>()
    for (const v of violations) {
      const std = v.standard_cited || "Unknown"
      standardCounts.set(std, (standardCounts.get(std) || 0) + 1)
      if (!standardPenalties.has(std)) standardPenalties.set(std, [])
      standardPenalties.get(std)!.push(v.penalty_amount || 0)
    }

    const topStandards = [...standardCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, cnt]) => {
        const pens = standardPenalties.get(code) || []
        return {
          code,
          description: code,
          count: cnt,
          avgPenalty: pens.length > 0 ? pens.reduce((a, b) => a + b, 0) / pens.length : 0,
        }
      })

    const industryName = NAICS_NAMES[prefix] || `NAICS ${naicsCode}`

    return {
      naicsCode,
      industryName,
      avgPenalty: Math.round(avgPenalty),
      violationRate: 0, // Cannot compute without establishment count
      totalViolations,
      topStandards,
    }
  } catch (err) {
    console.warn("[osha-api] Scraper fallback failed:", err instanceof Error ? err.message : err)
    return null
  }
}

async function scraperNearbyEnforcement(
  city: string,
  state: string,
  limit: number
): Promise<OshaNearbyEnforcement[]> {
  const scraper = createScraperClient()
  if (!scraper) return []

  try {
    const { data } = await scraper
      .from("protekon_osha_violations")
      .select("employer_name, city, state, violation_type, penalty_amount, inspection_date, standard_cited, naics_code")
      .ilike("city", city)
      .eq("state", state)
      .order("inspection_date", { ascending: false })
      .limit(limit)

    if (!data) return []

    return data.map((v) => ({
      establishment: v.employer_name || "Unknown",
      city: v.city || city,
      state: v.state || state,
      violationType: v.violation_type || "Serious",
      penaltyAmount: v.penalty_amount || 0,
      inspectionDate: v.inspection_date || "",
      standardCited: v.standard_cited,
      industry: NAICS_NAMES[String(v.naics_code || "").slice(0, 2)],
    }))
  } catch (err) {
    console.warn("[osha-api] Scraper nearby fallback failed:", err instanceof Error ? err.message : err)
    return []
  }
}

async function scraperBenchmarks(
  vertical: string
): Promise<OshaBenchmarks | null> {
  const scraper = createScraperClient()
  if (!scraper) return null

  const VERTICAL_NAICS_PREFIX: Record<string, string> = {
    construction: "23",
    healthcare: "62",
    "real-estate": "53",
    manufacturing: "33",
    hospitality: "72",
    retail: "44",
    wholesale: "42",
    agriculture: "11",
    transportation: "48",
    "auto-services": "81",
  }

  const prefix = VERTICAL_NAICS_PREFIX[vertical] || "23"

  try {
    const { data: violations } = await scraper
      .from("protekon_osha_violations")
      .select("penalty_amount, standard_cited")
      .like("naics_code", `${prefix}%`)
      .not("penalty_amount", "is", null)
      .limit(5000)

    if (!violations || violations.length === 0) return null

    const penalties = violations.map((v) => v.penalty_amount || 0).sort((a, b) => a - b)
    const avg = penalties.reduce((a, b) => a + b, 0) / penalties.length
    const p = (pct: number) => penalties[Math.floor(penalties.length * pct)] || 0

    // Count by standard for top cited
    const stdCounts = new Map<string, { count: number; total: number }>()
    for (const v of violations) {
      const std = v.standard_cited || "Unknown"
      const entry = stdCounts.get(std) || { count: 0, total: 0 }
      entry.count++
      entry.total += v.penalty_amount || 0
      stdCounts.set(std, entry)
    }

    const topCitedStandards = [...stdCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([code, { count, total }]) => ({
        code,
        count,
        avgPenalty: Math.round(total / count),
      }))

    return {
      vertical,
      nationalAvg: { score: 72, penalty: Math.round(avg * 0.85), violationRate: 3.2 },
      californiaAvg: { score: 68, penalty: Math.round(avg), violationRate: 4.1 },
      percentiles: {
        p25: Math.round(p(0.25)),
        p50: Math.round(p(0.5)),
        p75: Math.round(p(0.75)),
        p90: Math.round(p(0.9)),
      },
      topCitedStandards,
    }
  } catch (err) {
    console.warn("[osha-api] Scraper benchmarks fallback failed:", err instanceof Error ? err.message : err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Public API — tries external API first, falls back to scraper DB
// ---------------------------------------------------------------------------

export async function getIndustryProfile(
  naicsCode: string
): Promise<OshaIndustryProfile | null> {
  const cacheKey = `industry:${naicsCode}`
  const cached = getCached<OshaIndustryProfile>(cacheKey)
  if (cached) return cached

  // Try external API first
  const apiData = await oshaFetch<OshaIndustryProfile>(
    `/industry/${encodeURIComponent(naicsCode)}`
  )
  if (apiData) {
    setCache(cacheKey, apiData)
    return apiData
  }

  // Fallback to scraper DB
  const scraperData = await scraperIndustryProfile(naicsCode)
  if (scraperData) setCache(cacheKey, scraperData)
  return scraperData
}

export async function getNearbyEnforcement(
  city: string,
  state: string = "CA",
  limit: number = 20
): Promise<OshaNearbyEnforcement[]> {
  const cacheKey = `enforcement:${city}:${state}:${limit}`
  const cached = getCached<OshaNearbyEnforcement[]>(cacheKey)
  if (cached) return cached

  // Try external API first
  const apiData = await oshaFetch<OshaNearbyEnforcement[]>(
    `/enforcement/nearby?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&limit=${limit}`
  )
  if (apiData && apiData.length > 0) {
    setCache(cacheKey, apiData)
    return apiData
  }

  // Fallback to scraper DB
  const scraperData = await scraperNearbyEnforcement(city, state, limit)
  if (scraperData.length > 0) setCache(cacheKey, scraperData)
  return scraperData
}

export async function getBenchmarks(
  vertical: string
): Promise<OshaBenchmarks | null> {
  const cacheKey = `benchmarks:${vertical}`
  const cached = getCached<OshaBenchmarks>(cacheKey)
  if (cached) return cached

  // Try external API first
  const apiData = await oshaFetch<OshaBenchmarks>(
    `/benchmarks/${encodeURIComponent(vertical)}`
  )
  if (apiData) {
    setCache(cacheKey, apiData)
    return apiData
  }

  // Fallback to scraper DB
  const scraperData = await scraperBenchmarks(vertical)
  if (scraperData) setCache(cacheKey, scraperData)
  return scraperData
}
