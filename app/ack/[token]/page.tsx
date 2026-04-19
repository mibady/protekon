import { createAdminClient } from "@/lib/supabase/admin"
import { SignerForm } from "@/components/v2/acks/SignerForm"

/**
 * PUBLIC acknowledgment signer page.
 *
 * No sidebar, no banner, no auth guard — this route is intentionally
 * outside /dashboard so the dashboard layout's auth middleware does not
 * apply. The token in the URL IS the auth: it's single-use, time-boxed,
 * and revoked on sign (the API route also enforces this).
 *
 * The page runs directly against the admin client (same pattern as the
 * GET /api/ack/sign/[token] handler) because the acknowledgment_tokens
 * table denies all authenticated reads by RLS policy — the only way to
 * read a token row is via service role.
 */

// Disable static optimisation — each token lookup is per-request.
export const dynamic = "force-dynamic"

type TokenRequest = {
  policy_document_id: string
  policy_version: string
  cohort_note: string | null
  due_date: string | null
  client_id: string
}

function firstRequest(
  r: TokenRequest | TokenRequest[] | null
): TokenRequest | null {
  if (!r) return null
  return Array.isArray(r) ? r[0] ?? null : r
}

export default async function AckSignerPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: tok } = await admin
    .from("acknowledgment_tokens")
    .select(
      "token, assigned_to, expires_at, used_at, acknowledgment_requests!inner(policy_document_id, policy_version, cohort_note, due_date, client_id)"
    )
    .eq("token", token)
    .maybeSingle()

  const invalid = !tok
  const alreadySigned = tok?.used_at != null
  const expired =
    !!tok?.expires_at && new Date(tok.expires_at as string) < new Date()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--parchment)",
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 560,
          padding: "32px 20px 80px",
        }}
      >
        <div
          className="font-display mb-10"
          style={{
            color: "var(--ink)",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          Protekon
        </div>

        <div
          className="font-display uppercase mb-3"
          style={{
            color: "var(--ink)",
            opacity: 0.5,
            fontSize: "11px",
            letterSpacing: "3px",
            fontWeight: 500,
          }}
        >
          POLICY ACKNOWLEDGMENT
        </div>

        {invalid && (
          <Unavailable
            title="This link is no longer valid."
            body="Please ask the sender to generate a new acknowledgment link."
          />
        )}

        {!invalid && alreadySigned && (
          <Unavailable
            title="This link has already been used."
            body="Each acknowledgment link is single-use. Contact the sender if you need to sign again."
          />
        )}

        {!invalid && !alreadySigned && expired && (
          <Unavailable
            title="This link has expired."
            body="Ask the sender to issue a new acknowledgment link."
          />
        )}

        {!invalid && !alreadySigned && !expired && tok && (
          <SignerReady tok={tok} token={token} />
        )}
      </div>
    </div>
  )
}

function Unavailable({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h1
        className="font-display tracking-tight mb-3"
        style={{
          color: "var(--ink)",
          fontSize: "28px",
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
          fontSize: "15px",
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
    </div>
  )
}

function SignerReady({
  tok,
  token,
}: {
  tok: {
    assigned_to: string | null
    acknowledgment_requests:
      | TokenRequest
      | TokenRequest[]
      | null
  }
  token: string
}) {
  const req = firstRequest(tok.acknowledgment_requests)
  if (!req) {
    return (
      <Unavailable
        title="Campaign unavailable."
        body="We couldn't find the campaign for this link."
      />
    )
  }

  const titleLine = req.cohort_note
    ? `${req.policy_version} · ${req.cohort_note}`
    : req.policy_version

  return (
    <>
      <h1
        className="font-display tracking-tight mb-6"
        style={{
          color: "var(--ink)",
          fontSize: "28px",
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {titleLine}
      </h1>

      <SignerForm
        token={token}
        policyVersion={req.policy_version}
        cohortNote={req.cohort_note}
        dueDate={req.due_date}
        assignedTo={tok.assigned_to}
      />
    </>
  )
}
