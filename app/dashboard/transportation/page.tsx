import { Truck } from "@phosphor-icons/react/dist/ssr"
import { VerticalOverview } from "@/components/dashboard/VerticalOverview"
import { getTransportationSummary } from "@/lib/actions/transportation-summary"

export default async function TransportationPage() {
  const summary = await getTransportationSummary()
  return (
    <VerticalOverview
      title="Transportation"
      description="DOT driver files, medical cards, hours-of-service audits, and fleet vehicle inspection records."
      icon={Truck}
      summary={summary}
      emptyCta={{
        label: "Add a driver",
        href: "/dashboard/transportation/fleet",
        description: "Track drivers, vehicles, and medical certifications to keep your fleet DOT-compliant.",
      }}
    />
  )
}
