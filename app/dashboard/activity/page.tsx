import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { Card } from "@/components/v2/primitives/Card"
import { listAuditLog } from "@/lib/actions/audit-trail"
import { getAlerts } from "@/lib/actions/alerts"
import { ActivityTimeline, mergeActivity } from "@/components/v2/activity/ActivityTimeline"

export const dynamic = "force-dynamic"

export default async function ActivityPage() {
  const [audit, alertsResult] = await Promise.all([
    listAuditLog({ limit: 100 }),
    getAlerts(0, 50),
  ])
  const alerts = alertsResult.data ?? []
  const rows = mergeActivity(audit, alerts)

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY BUSINESS · ACTIVITY"
        title="Everything I've done for you, on the record."
        subtitle="A unified timeline of alerts I've raised and actions logged against your account. Auditor-ready, carrier-ready, and yours."
      />

      <Card>
        <ActivityTimeline rows={rows} />
      </Card>
    </div>
  )
}
