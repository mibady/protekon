import { Storefront } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getRetailSummary } from "@/lib/actions/retail-summary"

export default async function RetailPage() {
  const summary = await getRetailSummary()
  return (
    <VerticalOverview
      title="Retail"
      description="Store-location rollups, SB 553 WVPP program, loss-prevention incident logs, and poster compliance."
      icon={Storefront}
      summary={summary}
      emptyCta={{
        label: "Add a location",
        href: "/dashboard/retail/locations",
        description: "Track store locations, managers, and WVPP status across your retail footprint.",
      }}
    />
  )
}
