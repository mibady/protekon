import { Gear } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getManufacturingSummary } from "@/lib/actions/manufacturing-summary"

export default async function ManufacturingPage() {
  const summary = await getManufacturingSummary()
  return (
    <VerticalOverview
      title="Manufacturing"
      description="Machine guarding, lockout/tagout, equipment inspections, and process safety management for production floors."
      icon={Gear}
      summary={summary}
      emptyCta={{
        label: "Add equipment",
        href: "/dashboard/manufacturing/equipment",
        description: "Inventory production equipment with LOTO and inspection schedules to stay audit-ready.",
      }}
    />
  )
}
