import { createAdminClient } from "@/lib/supabase/admin"
import { SubPortalClient } from "@/components/v2/subs/SubPortalClient"
import { SubPortalShell } from "@/components/v2/subs/SubPortalShell"

/**
 * PUBLIC sub onboarding portal.
 *
 * No sidebar, no banner, no auth guard. Route lives outside /dashboard so
 * the dashboard layout's auth gate does not apply. The token IS the auth:
 * single-use, time-boxed, and revoked on submit. We go directly to the
 * admin client (same pattern as /ack/[token]/page.tsx) because the
 * `sub_onboarding_tokens` table is deny-all by RLS.
 *
 * Submission itself flows through POST /api/sub-onboarding/submit/[token]
 * which handles the multipart W-9 upload + MSA signature + submission row.
 */
export const dynamic = "force-dynamic"

export default async function SubPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: tok } = await admin
    .from("sub_onboarding_tokens")
    .select(
      "token, sub_company_name, contact_name, contact_email, expires_at, used_at"
    )
    .eq("token", token)
    .maybeSingle()

  const invalid = !tok
  const alreadySubmitted = tok?.used_at != null
  const expired =
    !!tok?.expires_at && new Date(tok.expires_at as string) < new Date()

  if (invalid) {
    return (
      <SubPortalShell>
        <Unavailable
          title="This link is no longer valid."
          body="Please ask the contractor that invited you to generate a new onboarding link."
        />
      </SubPortalShell>
    )
  }
  if (alreadySubmitted) {
    return (
      <SubPortalShell>
        <Unavailable
          title="This link has already been used."
          body="Your onboarding was received. If you need to resubmit, ask the contractor for a new link."
        />
      </SubPortalShell>
    )
  }
  if (expired) {
    return (
      <SubPortalShell>
        <Unavailable
          title="This link has expired."
          body="Ask the contractor to send a new onboarding invite."
        />
      </SubPortalShell>
    )
  }

  return (
    <SubPortalShell>
      <SubPortalClient
        token={token}
        companyName={tok!.sub_company_name}
        contactName={tok!.contact_name}
        contactEmail={tok!.contact_email}
      />
    </SubPortalShell>
  )
}

function Unavailable({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div
        className="font-display uppercase mb-2"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: 11,
          letterSpacing: "3px",
          fontWeight: 500,
        }}
      >
        SUB ONBOARDING
      </div>
      <h1
        className="font-display tracking-tight mb-3"
        style={{
          color: "var(--ink)",
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <p
        className="font-sans"
        style={{
          color: "var(--ink)",
          opacity: 0.7,
          fontSize: 15,
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
    </div>
  )
}
