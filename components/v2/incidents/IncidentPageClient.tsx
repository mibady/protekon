"use client"

import { useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { IncidentTable, type IncidentRow } from "./IncidentTable"
import { NewIncidentModal } from "./NewIncidentModal"
import { MarkReportedDialog } from "./MarkReportedDialog"
import { useRouter } from "next/navigation"

/**
 * Thin client shell that owns modal state for the Incident Log surface.
 * The page itself stays a server component so reads stream from the DB
 * without a client roundtrip.
 */
type IncidentPageClientProps = {
  incidents: IncidentRow[]
}

export function IncidentPageClient({ incidents }: IncidentPageClientProps) {
  const [newOpen, setNewOpen] = useState(false)
  const [activeIncident, setActiveIncident] = useState<IncidentRow | null>(null)
  const router = useRouter()

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <CTAButton onClick={() => setNewOpen(true)} icon={false}>
          New incident
        </CTAButton>
      </div>

      <IncidentTable
        incidents={incidents}
        onRowClick={(i) => setActiveIncident(i)}
      />

      <NewIncidentModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => router.refresh()}
      />

      <MarkReportedDialog
        incident={activeIncident}
        open={activeIncident !== null}
        onClose={() => setActiveIncident(null)}
      />
    </>
  )
}
