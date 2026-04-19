import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { getDocuments, getAvailableDocTypesForUser } from "@/lib/actions/documents"
import { DocumentsPageClient } from "@/components/v2/documents/DocumentsPageClient"

export const dynamic = "force-dynamic"

export default async function DocumentsPage() {
  const [documents, docTypes] = await Promise.all([
    getDocuments(),
    getAvailableDocTypesForUser(),
  ])

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY BUSINESS · DOCUMENTS"
        title="Every plan you own, in one library."
        subtitle="Request a new plan, revisit past versions, and see what's current, in review, or past due — all in one place."
      />

      <DocumentsPageClient documents={documents} docTypes={docTypes} />
    </div>
  )
}
