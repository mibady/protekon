import { HardHat } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getConstructionSummary } from "@/lib/actions/construction-summary"

export default async function ConstructionPage() {
  const summary = await getConstructionSummary()
  return (
    <VerticalOverview
      title="Construction"
      description="Subcontractor prequalification, COI tracking, OSHA 300 logs, and jobsite safety program compliance."
      icon={HardHat}
      summary={summary}
      emptyCta={{
        label: "Add a subcontractor",
        href: "/dashboard/construction/subcontractors",
        description: "Prequalify subs, track COIs, and keep OSHA 300 logs current across every active jobsite.",
      }}
    />
  )
}
