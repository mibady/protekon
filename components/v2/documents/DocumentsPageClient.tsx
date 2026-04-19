"use client"

import { useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { Card } from "@/components/v2/primitives/Card"
import { DocumentsTable } from "./DocumentsTable"
import { RequestDocumentModal } from "./RequestDocumentModal"
import type { Document } from "@/lib/types"

type DocType = {
  id: string
  title: string
  description: string
  regulation: string
  sectionCount: number
  isVerticalSpecific: boolean
}

type DocumentsPageClientProps = {
  documents: Document[]
  docTypes: DocType[]
}

export function DocumentsPageClient({ documents, docTypes }: DocumentsPageClientProps) {
  const [requestOpen, setRequestOpen] = useState(false)

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <CTAButton onClick={() => setRequestOpen(true)} icon={false}>
          Request document
        </CTAButton>
      </div>

      <Card>
        <DocumentsTable documents={documents} />
      </Card>

      <RequestDocumentModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        docTypes={docTypes}
      />
    </>
  )
}
