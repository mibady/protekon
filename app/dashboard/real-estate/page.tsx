import { Buildings } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getRealEstateSummary } from "@/lib/actions/real-estate-summary"

export default async function RealEstatePage() {
  const summary = await getRealEstateSummary()
  return (
    <VerticalOverview
      title="Real Estate"
      description="Property-portfolio compliance, habitability inspections, AB 2747 notices, and tenant-safety incident tracking."
      icon={Buildings}
      summary={summary}
      emptyCta={{
        label: "Add a property",
        href: "/dashboard/real-estate/properties",
        description: "Track each property's compliance posture, inspections, and tenant-facing notices in one place.",
      }}
    />
  )
}
