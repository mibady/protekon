"use client"

import { useState } from "react"
import { Card } from "@/components/v2/primitives/Card"
import { VendorRiskList } from "./VendorRiskList"
import { VendorDetailModal } from "./VendorDetailModal"
import type { SubWithRisk } from "@/lib/actions/vendor-risk"

type VendorRiskPageClientProps = {
  subs: SubWithRisk[]
}

export function VendorRiskPageClient({ subs }: VendorRiskPageClientProps) {
  const [detailSubId, setDetailSubId] = useState<string | null>(null)

  return (
    <>
      <Card padding="p-0">
        <VendorRiskList subs={subs} onRowClick={(id) => setDetailSubId(id)} />
      </Card>

      <VendorDetailModal
        subId={detailSubId}
        onClose={() => setDetailSubId(null)}
      />
    </>
  )
}
