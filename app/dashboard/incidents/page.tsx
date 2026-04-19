import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { getIncidents } from "@/lib/actions/incidents"
import { IncidentPageClient } from "@/components/v2/incidents/IncidentPageClient"
import type { IncidentRow } from "@/components/v2/incidents/IncidentTable"

export default async function IncidentsPage() {
  const incidents = (await getIncidents()) as IncidentRow[]

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY BUSINESS · INCIDENT LOG"
        title="Every incident, logged on the clock that matters."
        subtitle="Start a report here and I pre-fill the DIR Form 36 fields. Everything stays on your retention clock for the required five years."
      />

      <IncidentPageClient incidents={incidents} />
    </div>
  )
}
