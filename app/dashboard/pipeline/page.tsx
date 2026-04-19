import { getRegulations } from "@/lib/actions/reports"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { RulemakingTimeline } from "@/components/v2/pipeline/RulemakingTimeline"
import type { RegulationRow } from "@/components/v2/regs/RegulationsFeed"

export const dynamic = "force-dynamic"

export default async function PipelinePage() {
  const rows = (await getRegulations()) as RegulationRow[]

  return (
    <div className="px-10 py-10" style={{ maxWidth: 1400 }}>
      <PageHeader
        eyebrow="INTELLIGENCE · RULEMAKING & HISTORY"
        title="The timeline that landed you here."
        subtitle="Effective dates, supersession, and version diffs for every rule that matters to your work."
      />

      <RulemakingTimeline rows={rows} />
    </div>
  )
}
