import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listCoiRecords, getCoiSummary } from "@/lib/actions/coi"
import { getSubcontractors } from "@/lib/actions/construction"
import { CoiPageClient } from "@/components/v2/subs/CoiPageClient"

export const dynamic = "force-dynamic"

export default async function CoiVerificationPage() {
  const [records, summary, subs] = await Promise.all([
    listCoiRecords(),
    getCoiSummary(),
    getSubcontractors(),
  ])
  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY SUBS · COI VERIFICATION"
        title="Every certificate of insurance, checked against your required coverage floor."
        subtitle="Upload a COI and I extract the carrier, limits, additional insureds, and expiration. Rule check runs after."
      />
      <CoiPageClient records={records} summary={summary} subs={subs ?? []} />
    </div>
  )
}
