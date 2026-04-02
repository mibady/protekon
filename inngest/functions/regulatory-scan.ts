import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getComplianceOfficerEmail, getSiteUrl } from "@/lib/resend"

// Cal/OSHA regulatory feed categories to scan
const SCAN_SOURCES = [
  {
    jurisdiction: "California",
    category: "workplace-safety",
    feedUrl: "https://www.dir.ca.gov/dosh/puborder/rss-feed.xml",
    label: "Cal/OSHA Workplace Safety",
  },
  {
    jurisdiction: "California",
    category: "wage-labor",
    feedUrl: "https://www.dir.ca.gov/dlse/rss-feed.xml",
    label: "DLSE Wage & Labor",
  },
  {
    jurisdiction: "Federal",
    category: "osha-federal",
    feedUrl: "https://www.osha.gov/rss/whatsnew.xml",
    label: "Federal OSHA Updates",
  },
]

interface FeedItem {
  title: string
  summary: string
  effectiveDate: string | null
  sourceUrl: string
  severity: string
}

async function parseFeed(feedUrl: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(feedUrl, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return []

    const text = await res.text()
    const items: FeedItem[] = []

    // Simple XML parsing for RSS <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match
    while ((match = itemRegex.exec(text)) !== null && items.length < 10) {
      const block = match[1]
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || ""
      const description = block.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || block.match(/<description>(.*?)<\/description>/)?.[1] || ""
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] || ""
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""

      if (title) {
        // Estimate severity from keywords
        const text = `${title} ${description}`.toLowerCase()
        const severity = text.includes("emergency") || text.includes("immediate") || text.includes("violation")
          ? "high"
          : text.includes("amendment") || text.includes("update") || text.includes("change")
            ? "medium"
            : "low"

        items.push({
          title: title.replace(/<[^>]*>/g, "").trim(),
          summary: description.replace(/<[^>]*>/g, "").trim().slice(0, 500),
          effectiveDate: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : null,
          sourceUrl: link.trim(),
          severity,
        })
      }
    }

    return items
  } catch (err) {
    console.error(`[regulatory-scan] Failed to parse feed ${feedUrl}:`, err instanceof Error ? err.message : err)
    return []
  }
}

export const regulatoryScan = inngest.createFunction(
  { id: "regulatory-scan", triggers: [{ cron: "0 6 * * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()
    let totalNew = 0

    // Step 1: Scan each regulatory feed source
    for (const source of SCAN_SOURCES) {
      const newItems = await step.run(`scan-${source.category}`, async () => {
        const items = await parseFeed(source.feedUrl)
        let inserted = 0

        for (const item of items) {
          // Deduplicate by title + jurisdiction
          const { data: existing } = await supabase
            .from("regulatory_updates")
            .select("id")
            .eq("title", item.title)
            .eq("jurisdiction", source.jurisdiction)
            .limit(1)

          if (existing && existing.length > 0) continue

          // AI impact analysis (HEAD layer) — enhances severity classification
          let aiSeverity = item.severity
          let aiMetadata = null
          try {
            const { analyzeRegulatoryImpact } = await import("@/lib/ai/regulatory-analyzer")
            const analysis = await analyzeRegulatoryImpact({
              title: item.title,
              summary: item.summary,
              jurisdiction: source.jurisdiction,
              category: source.category,
              sourceUrl: item.sourceUrl,
              effectiveDate: item.effectiveDate,
            })
            // Map AI impact level to severity
            aiSeverity = analysis.impactLevel === "critical" || analysis.impactLevel === "high"
              ? "high"
              : analysis.impactLevel === "medium"
                ? "medium"
                : "low"
            aiMetadata = {
              affectedDocuments: analysis.affectedDocuments,
              affectedIndustries: analysis.affectedIndustries,
              clientAction: analysis.clientAction,
              complianceDeadline: analysis.complianceDeadline,
              penaltyRisk: analysis.penaltyRisk,
              aiSummary: analysis.summary,
            }
          } catch (err) {
            console.warn("[regulatory-scan] AI analysis failed for:", item.title, err instanceof Error ? err.message : err)
          }

          await supabase.from("regulatory_updates").insert({
            jurisdiction: source.jurisdiction,
            category: source.category,
            title: item.title,
            summary: aiMetadata?.aiSummary || item.summary,
            effective_date: item.effectiveDate,
            source_url: item.sourceUrl,
            severity: aiSeverity,
          })
          inserted++
        }

        return inserted
      })

      totalNew += newItems
    }

    // Step 2: Notify compliance officer if high-severity items found
    if (totalNew > 0) {
      await step.run("notify-new-updates", async () => {
        const officerEmail = getComplianceOfficerEmail()
        await sendEmail({
          to: officerEmail,
          subject: `Regulatory Scan: ${totalNew} new update${totalNew === 1 ? "" : "s"} found`,
          html: `<p>${totalNew} new regulatory update${totalNew === 1 ? " has" : "s have"} been added to Protekon. <a href="${getSiteUrl()}/dashboard/regulations">Review now</a>.</p>`,
        })
      })
    }

    return { success: true, newUpdates: totalNew, scannedAt: new Date().toISOString() }
  }
)
