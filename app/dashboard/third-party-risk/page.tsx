import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import { getCurrentVertical } from "@/lib/v2/vertical"
import { getDashboardTerminology } from "@/lib/v2/terminology"

export const dynamic = "force-dynamic"

type HubModule = {
  key: string
  name: string
  href: string
  description: string
}

function getHubModules(thirdParty: string): HubModule[] {
  return [
    {
      key: "vendor_risk",
      name: `${thirdParty} Risk Score`,
      href: "/dashboard/vendor-risk",
      description: `Live posture rating for every ${thirdParty.toLowerCase()} on file. Sort by exposure, drill into open gaps.`,
    },
    {
      key: "coi_verification",
      name: "COI Verification",
      href: "/dashboard/coi-verification",
      description: "Certificate of insurance review queue — verify coverage limits, additional insured status, and expiry.",
    },
    {
      key: "sub_onboarding",
      name: `${thirdParty} Onboarding`,
      href: "/dashboard/sub-onboarding",
      description: `Send a self-serve intake link. Collect W-9, COI, license, and safety attestation in one flow.`,
    },
    {
      key: "form_1099",
      name: "1099-NEC",
      href: "/dashboard/form-1099",
      description: "Year-end tax packet for non-employee compensation. W-9 capture and EOY filing prep.",
    },
    {
      key: "safety_programs",
      name: "Safety Programs",
      href: "/dashboard/safety-programs",
      description: `Written programs you require ${thirdParty.toLowerCase()}s to acknowledge before stepping on site.`,
    },
    {
      key: "projects",
      name: "Projects",
      href: "/dashboard/projects",
      description: `Active jobs with the ${thirdParty.toLowerCase()} roster, project-level COI requirements, and prevailing wage flags.`,
    },
  ]
}

export default async function ThirdPartyRiskHubPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/dashboard/third-party-risk")

  const verticalSlug = await getCurrentVertical()
  const terminology = getDashboardTerminology(verticalSlug)
  const modules = getHubModules(terminology.thirdParty)

  return (
    <div className="px-10 py-10" style={{ maxWidth: 1400 }}>
      <PageHeader
        eyebrow={`MY BUSINESS · ${terminology.thirdPartyGroupLabel.toUpperCase()}`}
        title={`${terminology.thirdParty} Risk`}
        subtitle={`Everything you need to keep your ${terminology.thirdPartyPlural.toLowerCase()} compliant — onboarding, insurance, tax forms, and the safety programs they sign before working with you.`}
      />

      <div className="mb-6">
        <SectionLabel>Modules</SectionLabel>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {modules.map((m) => (
          <Link
            key={m.key}
            href={m.href}
            className="block p-6 transition-colors hover:brightness-105"
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11,29,58,0.08)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div
                  className="font-display"
                  style={{
                    color: "var(--midnight)",
                    fontSize: "18px",
                    fontWeight: 700,
                    lineHeight: 1.25,
                    marginBottom: 6,
                  }}
                >
                  {m.name}
                </div>
                <div
                  className="font-sans"
                  style={{
                    color: "var(--steel)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {m.description}
                </div>
              </div>
              <span
                className="font-display uppercase flex items-center gap-2 flex-shrink-0"
                style={{
                  color: "var(--enforcement)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                Open <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
