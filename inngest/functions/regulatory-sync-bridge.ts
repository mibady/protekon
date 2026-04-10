import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { getIndustryProfile } from "@/lib/osha-api"

// Key verticals Protekon serves — mapped to representative NAICS codes
const VERTICALS = [
  { name: "construction", naicsCode: "236220" },
  { name: "healthcare", naicsCode: "621111" },
  { name: "real-estate", naicsCode: "531210" },
  { name: "manufacturing", naicsCode: "332710" },
  { name: "hospitality", naicsCode: "721110" },
  { name: "retail", naicsCode: "445110" },
]

export const regulatorySyncBridge = inngest.createFunction(
  {
    id: "regulatory-sync-bridge",
    triggers: [
      { event: "compliance/regulatory.sync-requested" },
      { cron: "0 5 * * 0" },
    ],
  },
  async ({ step }) => {
    // Step 1: Fetch OSHA industry profiles for each vertical
    const profiles = await step.run("fetch-osha-updates", async () => {
      const results: {
        vertical: string
        naicsCode: string
        industryName: string
        totalViolations: number
        avgPenalty: number
        topStandards: { code: string; description: string; count: number }[]
      }[] = []

      for (const v of VERTICALS) {
        const profile = await getIndustryProfile(v.naicsCode)
        if (profile) {
          results.push({
            vertical: v.name,
            naicsCode: profile.naicsCode,
            industryName: profile.industryName,
            totalViolations: profile.totalViolations,
            avgPenalty: profile.avgPenalty,
            topStandards: profile.topStandards.slice(0, 5),
          })
        }
      }

      return results
    })

    // Step 2: Upsert into regulatory_updates
    const counts = await step.run("upsert-updates", async () => {
      const supabase = createAdminClient()
      let newCount = 0
      let updatedCount = 0

      for (const profile of profiles) {
        // Create a regulatory update for each top standard violation
        for (const std of profile.topStandards) {
          const title = `OSHA ${std.code}: ${std.description}`
          const jurisdiction = "Federal"

          // Check if exists (dedup by title + jurisdiction)
          const { data: existing } = await supabase
            .from("regulatory_updates")
            .select("id")
            .eq("title", title)
            .eq("jurisdiction", jurisdiction)
            .limit(1)

          const severity =
            profile.avgPenalty > 15000 || std.count > 100
              ? "high"
              : std.count > 50
                ? "medium"
                : "low"

          const summary = `Industry: ${profile.industryName} (NAICS ${profile.naicsCode}). Standard ${std.code} cited ${std.count} times. Average penalty: $${profile.avgPenalty.toLocaleString()}. Total industry violations: ${profile.totalViolations}.`

          if (existing && existing.length > 0) {
            // Update existing
            await supabase
              .from("regulatory_updates")
              .update({
                summary,
                severity,
                category: "osha-industry-intel",
              })
              .eq("id", existing[0].id)
            updatedCount++
          } else {
            // Insert new
            await supabase.from("regulatory_updates").insert({
              jurisdiction,
              category: "osha-industry-intel",
              title,
              summary,
              severity,
              source_url: `https://www.osha.gov/laws-regs/regulations/standardnumber/${std.code}`,
              effective_date: null,
            })
            newCount++
          }
        }
      }

      return { newCount, updatedCount }
    })

    // Step 3: Log results
    const result = await step.run("log-results", async () => {
      return {
        success: true,
        verticalsScanned: profiles.length,
        newUpdates: counts.newCount,
        updatedExisting: counts.updatedCount,
        syncedAt: new Date().toISOString(),
      }
    })

    return result
  }
)
