import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { DocumentsBoard } from "@/components/onboarding/step-6-documents/DocumentsBoard"
import type { DocumentCard } from "@/components/onboarding/step-6-documents/DocumentsBoard"

type DocRow = {
  id: string
  document_id: string | null
  type: string
  filename: string | null
  status: string
}

type SkippedMetadataShape = {
  skipped_document_categories?: string[]
}

const NEEDS_REVIEW_STATUSES = new Set([
  "requested",
  "imported",
  "uploaded",
  "pending_review",
])

const APPROVED_STATUSES = new Set(["approved", "generated"])

export default async function DocumentsPage() {
  const stateResult = await getOnboardingState()
  if (!stateResult.ok) redirect("/login?next=/onboarding/documents")
  if (stateResult.data.currentStep === 0) redirect("/onboarding/business")

  const state = stateResult.data
  const supabase = await createClient()

  const { data: docs } = await supabase
    .from("documents")
    .select("id, document_id, type, filename, status")
    .eq("client_id", state.client.id)
    .order("created_at", { ascending: false })
    .returns<DocRow[]>()

  const rows: DocumentCard[] = (docs ?? []).map((row) => ({
    id: row.id,
    document_id: row.document_id,
    type: row.type,
    filename: row.filename,
    status: row.status,
  }))

  const needsReview = rows.filter((doc) =>
    NEEDS_REVIEW_STATUSES.has(doc.status),
  )
  const approved = rows.filter((doc) => APPROVED_STATUSES.has(doc.status))

  const coveredCategories = Array.from(
    new Set(approved.map((d) => d.type)),
  )

  const { data: clientRow } = await supabase
    .from("clients")
    .select("vertical_metadata")
    .eq("id", state.client.id)
    .single<{ vertical_metadata: SkippedMetadataShape | null }>()

  const skippedCategories =
    clientRow?.vertical_metadata?.skipped_document_categories ?? []

  return (
    <DocumentsBoard
      needsReview={needsReview}
      approved={approved}
      requiredCategories={state.config.requiredDocCategories}
      recommendedCategories={state.config.recommendedDocCategories}
      coveredCategories={coveredCategories}
      skippedCategories={skippedCategories}
      stepIntro={state.config.stepCopy.documents.intro}
      templateLibraryCta={state.config.stepCopy.documents.templateLibraryCta}
    />
  )
}
