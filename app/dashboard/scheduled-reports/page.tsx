import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { Card } from "@/components/v2/primitives/Card"
import { getDeliveryPreferences } from "@/lib/actions/scheduled-deliveries"
import { ScheduledReportsClient } from "@/components/v2/scheduled-reports/ScheduledReportsClient"

export const dynamic = "force-dynamic"

export default async function ScheduledReportsPage() {
  const deliveries = await getDeliveryPreferences()

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="ACCOUNT · SCHEDULED REPORTS"
        title="The right report. The right cadence. Automatic."
        subtitle="Weekly briefings, monthly summaries, quarterly packets — I generate and send each on schedule so nobody has to remember."
      />

      <Card>
        <ScheduledReportsClient deliveries={deliveries} />
      </Card>
    </div>
  )
}
