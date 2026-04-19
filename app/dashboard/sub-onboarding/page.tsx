import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listOnboardingSubmissions } from "@/lib/actions/sub-onboarding"
import { SubOnboardingPageClient } from "@/components/v2/subs/SubOnboardingPageClient"

/**
 * Sub Onboarding dashboard surface.
 *
 * Shows pending invites (still-open tokens) + submitted-for-review records
 * + historical approvals/rejections. The actual W-9 + MSA capture happens
 * on the public `/sub/[token]` portal — this page is the owner's review
 * desk.
 */
export const dynamic = "force-dynamic"

export default async function SubOnboardingPage() {
  const { submissions, pending } = await listOnboardingSubmissions()

  return (
    <>
      <PageHeader
        eyebrow="MY SUBS · SUB ONBOARDING"
        title="Onboard subs without chasing them."
        subtitle="Send an invite, they submit their W-9 and sign your MSA. You review and approve — no email ping-pong."
      />
      <SubOnboardingPageClient
        submissions={submissions}
        pending={pending}
      />
    </>
  )
}
