import { FirstAidKit } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getHealthcareSummary } from "@/lib/actions/healthcare-summary"

export default async function HealthcarePage() {
  const summary = await getHealthcareSummary()
  return (
    <VerticalOverview
      title="Healthcare"
      description="HIPAA PHI inventory, Business Associate Agreements, and workplace-violence prevention (SB 553) for clinical settings."
      icon={FirstAidKit}
      summary={summary}
      emptyCta={{
        label: "Add a BAA",
        href: "/dashboard/healthcare/baa-tracker",
        description: "Track Business Associate Agreements and PHI systems to maintain HIPAA compliance posture.",
      }}
    />
  )
}
