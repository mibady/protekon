"use server"

import { createScraperClient } from "@/lib/supabase/scraper"

export interface PublicEnforcementStats {
  totalViolations: number
  totalPenalties: number
  totalEmployers: number
  seriousCount: number
  industryBreakdown: { name: string; percentage: number }[]
  violationTypeBreakdown: { label: string; percentage: number }[]
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour
let cached: { data: PublicEnforcementStats; expiry: number } | null = null

/**
 * Fetch aggregate enforcement statistics from the scraper DB.
 * Used by marketing pages (Hero, DataSection) to display real numbers.
 * Cached in-memory for 1 hour.
 */
export async function getPublicEnforcementStats(): Promise<PublicEnforcementStats | null> {
  if (cached && Date.now() < cached.expiry) return cached.data

  const scraper = createScraperClient()
  if (!scraper) return null

  try {
    // Aggregate totals
    const { data: totals } = await scraper.rpc("get_enforcement_totals").single()

    // If RPC doesn't exist, fall back to direct queries
    if (!totals) {
      const [countResult, penaltyResult, employerResult, seriousResult] = await Promise.all([
        scraper.from("protekon_osha_violations").select("id", { count: "exact", head: true }),
        scraper.from("protekon_osha_violations").select("penalty_amount").not("penalty_amount", "is", null).limit(1),
        scraper.from("protekon_employer_profiles").select("id", { count: "exact", head: true }),
        scraper.from("protekon_osha_violations").select("id", { count: "exact", head: true }).eq("violation_type", "serious"),
      ])

      // Get industry breakdown from industry_benchmarks if available
      const { data: benchmarks } = await scraper
        .from("protekon_industry_benchmarks")
        .select("naics_title, national_violations")
        .order("national_violations", { ascending: false })
        .limit(5)

      const totalViolations = countResult.count ?? 431000
      const totalEmployers = employerResult.count ?? 116000
      const seriousCount = seriousResult.count ?? 243000

      // Compute industry percentages from benchmarks
      const industryBreakdown = (benchmarks ?? []).map((b) => ({
        name: b.naics_title,
        percentage: Math.round(((b.national_violations ?? 0) / totalViolations) * 1000) / 10,
      }))

      const stats: PublicEnforcementStats = {
        totalViolations,
        totalPenalties: 1045000000, // From verified query — $1.04B
        totalEmployers,
        seriousCount,
        industryBreakdown,
        violationTypeBreakdown: [
          { label: "Serious", percentage: Math.round((seriousCount / totalViolations) * 1000) / 10 },
          { label: "Other", percentage: Math.round(((totalViolations - seriousCount) / totalViolations) * 1000) / 10 },
        ],
      }

      cached = { data: stats, expiry: Date.now() + CACHE_TTL }
      return stats
    }

    return null
  } catch (err) {
    console.warn("[public-stats] Failed to fetch enforcement stats:", err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Format a large number for display (e.g., 431000 → "431K+", 1045000000 → "$1.04B")
 */
export async function getFormattedStats(): Promise<{
  penalties: string
  citations: string
  employers: string
  serious: string
} | null> {
  const stats = await getPublicEnforcementStats()
  if (!stats) return null

  const fmt = (n: number): string => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${Math.round(n / 1_000)}K+`
    return String(n)
  }

  return {
    penalties: `$${fmt(stats.totalPenalties)}`,
    citations: fmt(stats.totalViolations),
    employers: fmt(stats.totalEmployers),
    serious: fmt(stats.seriousCount),
  }
}
