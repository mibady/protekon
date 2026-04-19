import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { Card } from "@/components/v2/primitives/Card"
import { AcceptForm } from "@/components/v2/team/AcceptForm"
import type { UserRole } from "@/lib/auth/roles"

export const dynamic = "force-dynamic"

type TokenRow = {
  token: string
  email: string
  role: UserRole
  expires_at: string
  used_at: string | null
}

/**
 * Public landing for team invite tokens. Uses admin client for the token
 * lookup (the team_invite_tokens table is deny-all at RLS) so this page
 * can give a useful error without a session. If the token is valid and
 * the user is not signed in, we bounce them to signup with email pre-filled.
 */
export default async function InviteLandingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: tok } = await admin
    .from("team_invite_tokens")
    .select("token, email, role, expires_at, used_at")
    .eq("token", token)
    .maybeSingle<TokenRow>()

  if (!tok) return <InviteError message="Invite link invalid." />
  if (tok.used_at) {
    return <InviteError message="This invite has already been used." />
  }
  if (new Date(tok.expires_at) < new Date()) {
    return <InviteError message="This invite has expired." />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/signup?email=${encodeURIComponent(tok.email)}&next=${encodeURIComponent(
        `/team/invite/${token}`
      )}`
    )
  }

  if (user.email?.toLowerCase() !== tok.email.toLowerCase()) {
    return (
      <InviteError
        message={`This invite is for ${tok.email}. Sign in as that email to accept.`}
      />
    )
  }

  return <AcceptForm token={token} email={tok.email} role={tok.role} />
}

function InviteError({ message }: { message: string }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "var(--parchment)" }}
    >
      <div className="w-full max-w-lg">
        <Card accent="steel" padding="p-8">
          <PageHeader
            eyebrow="PROTEKON · TEAM INVITE"
            title="Can't use this link."
          />
          <p
            className="font-sans"
            style={{ color: "var(--ink)", opacity: 0.7, fontSize: 15, lineHeight: 1.55 }}
          >
            {message}
          </p>
        </Card>
      </div>
    </main>
  )
}
