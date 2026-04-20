import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listIntegrations } from "@/lib/actions/integrations"
import { IntegrationsPageClient } from "@/components/v2/integrations/IntegrationsPageClient"

export const dynamic = "force-dynamic"

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    connected?: string
    error?: string
    provider?: string
    detail?: string
  }>
}) {
  const [integrations, sp] = await Promise.all([listIntegrations(), searchParams])
  return (
    <div className="px-8 pt-12 pb-12 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="ACCOUNT · INTEGRATIONS"
        title="The systems you already use. Wired in."
        subtitle="Protekon only works if it fits the tools you run your business with. Connect your payroll, accounting, and e-signature systems — we handle the rest."
      />
      <IntegrationsPageClient
        integrations={integrations}
        connectedProvider={sp.connected ?? null}
        errorCode={sp.error ?? null}
        errorProvider={sp.provider ?? null}
        errorDetail={sp.detail ?? null}
      />
    </div>
  )
}
