import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listSubsWithRisk } from "@/lib/actions/vendor-risk"
import { VendorRiskPageClient } from "@/components/v2/subs/VendorRiskPageClient"

export const dynamic = "force-dynamic"

export default async function VendorRiskPage() {
  const subs = await listSubsWithRisk()
  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY SUBS · VENDOR RISK SCORE"
        title="Where each sub ranks against your compliance floor."
        subtitle="Derived from CSLB license status, COI currency, and — later — incident history and training completion."
      />
      <VendorRiskPageClient subs={subs} />
    </div>
  )
}
