"use client"

import { Card } from "@/components/v2/primitives/Card"
import { CoiSummaryTiles } from "./CoiSummaryTiles"
import { CoiRecordsList } from "./CoiRecordsList"
import type { CoiRecord, CoiSummary } from "@/lib/actions/coi"

type AvailableSub = {
  id: string
  company_name: string
  license_number?: string | null
}

type CoiPageClientProps = {
  records: CoiRecord[]
  summary: CoiSummary
  subs: AvailableSub[]
}

export function CoiPageClient({ records, summary, subs }: CoiPageClientProps) {
  return (
    <>
      <CoiSummaryTiles summary={summary} />

      <div className="mt-6">
        <Card padding="p-0">
          <CoiRecordsList records={records} subs={subs} />
        </Card>
      </div>
    </>
  )
}
