import { Warehouse } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getWholesaleSummary } from "@/lib/actions/wholesale-summary"

export default async function WholesalePage() {
  const summary = await getWholesaleSummary()
  return (
    <VerticalOverview
      title="Wholesale"
      description="Forklift operator certifications, safety-zone layouts, racking inspections, and warehouse hazard communication."
      icon={Warehouse}
      summary={summary}
      emptyCta={{
        label: "Configure safety zones",
        href: "/dashboard/wholesale/zones",
        description: "Map warehouse zones and operator assignments to surface forklift compliance gaps early.",
      }}
    />
  )
}
