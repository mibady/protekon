"use client"

import { useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { CampaignTable } from "./CampaignTable"
import { NewCampaignModal } from "./NewCampaignModal"
import type { AckCampaign } from "@/lib/actions/acknowledgments"

/**
 * Client shell for the acknowledgments surface — owns modal state only.
 */
type AcksPageClientProps = {
  campaigns: AckCampaign[]
}

export function AcksPageClient({ campaigns }: AcksPageClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <CTAButton onClick={() => setOpen(true)} icon={false}>
          New campaign
        </CTAButton>
      </div>

      <CampaignTable campaigns={campaigns} />

      <NewCampaignModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
