import { getRegulations } from "@/lib/actions/reports"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { RegulationsFeed, type RegulationRow } from "@/components/v2/regs/RegulationsFeed"

export const dynamic = "force-dynamic"

export default async function RegChangesPage() {
  // `getRegulations` returns an inferred tuple-shaped object; cast via
  // `RegulationRow[]` to keep the feed component decoupled from the action.
  const rows = (await getRegulations()) as RegulationRow[]

  return (
    <div className="px-10 py-10" style={{ maxWidth: 1400 }}>
      <PageHeader
        eyebrow="INTELLIGENCE · REGULATORY CHANGES"
        title="New and amended rules that touch your trade."
        subtitle="Curated by compliance officers, not RSS noise."
      />

      <RegulationsFeed rows={rows} />
    </div>
  )
}
