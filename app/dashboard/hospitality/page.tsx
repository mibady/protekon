import { ForkKnife } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getHospitalitySummary } from "@/lib/actions/hospitality-summary"

export default async function HospitalityPage() {
  const summary = await getHospitalitySummary()
  return (
    <VerticalOverview
      title="Hospitality"
      description="Health-department inspections, food-safety logs, and guest-facing incident response for restaurants, hotels, and venues."
      icon={ForkKnife}
      summary={summary}
      emptyCta={{
        label: "Log an inspection",
        href: "/dashboard/hospitality/inspections",
        description: "Capture health-department inspections and corrective actions before your next audit cycle.",
      }}
    />
  )
}
