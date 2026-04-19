import { getOshaNearbyData, getOshaIndustryData } from "@/lib/actions/osha"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { NearbyEnforcementCard } from "@/components/v2/enforcement/NearbyEnforcementCard"
import { IndustryPatternsCard } from "@/components/v2/enforcement/IndustryPatternsCard"
import type { OshaNearbyEnforcement, OshaIndustryProfile } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function WhatsHappeningPage() {
  const [nearbyResult, industryResult] = await Promise.allSettled([
    getOshaNearbyData(),
    getOshaIndustryData(),
  ])

  const nearby: OshaNearbyEnforcement[] =
    nearbyResult.status === "fulfilled" ? nearbyResult.value : []
  const industry: OshaIndustryProfile | null =
    industryResult.status === "fulfilled" ? industryResult.value : null

  return (
    <div className="px-10 py-10" style={{ maxWidth: 1400 }}>
      <PageHeader
        eyebrow="INTELLIGENCE · ENFORCEMENT FEED"
        title="Citations, violations, and penalties in your trade and region."
        subtitle="Updated nightly from federal and state enforcement feeds."
      />

      <div className="space-y-6">
        <NearbyEnforcementCard rows={nearby} />
        <IndustryPatternsCard profile={industry} />
      </div>
    </div>
  )
}
