import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listCampaigns } from "@/lib/actions/acknowledgments"
import { AcksPageClient } from "@/components/v2/acks/AcksPageClient"

export default async function AcknowledgmentsPage() {
  const campaigns = await listCampaigns()

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY BUSINESS · ACKNOWLEDGMENTS"
        title="Policies, signed by the people they bind."
        subtitle="Send a policy to a worker — they sign on a mobile browser, you get an immutable stitched PDF with a hash and the IP."
      />

      <AcksPageClient campaigns={campaigns} />
    </div>
  )
}
