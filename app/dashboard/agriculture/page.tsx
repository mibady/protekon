import { Plant } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getAgricultureSummary } from "@/lib/actions/agriculture-summary"

export default async function AgriculturePage() {
  const summary = await getAgricultureSummary()
  return (
    <VerticalOverview
      title="Agriculture"
      description="Heat illness prevention (Cal/OSHA §3395), pesticide handling, crew rosters, and AG field safety tracking."
      icon={Plant}
      summary={summary}
      emptyCta={{
        label: "Add a crew",
        href: "/dashboard/agriculture/crews",
        description: "Track crews, supervisors, and heat-illness training to stay ahead of Cal/OSHA §3395 enforcement.",
      }}
    />
  )
}
