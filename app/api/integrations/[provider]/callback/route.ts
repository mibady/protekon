import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getProvider } from "@/lib/integrations/registry"
import { exchangeCodeForTokens } from "@/lib/integrations/oauth"
import { encryptToken } from "@/lib/integrations/crypto"

const STATE_COOKIE_NAME = "integrations_oauth_state"

function redirectToDashboard(
  req: NextRequest,
  params: Record<string, string>
): NextResponse {
  const url = new URL("/dashboard/integrations", req.url)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return NextResponse.redirect(url)
}

/**
 * GET — OAuth redirect endpoint. Validates the CSRF state cookie,
 * exchanges the authorization code for tokens, encrypts them at rest
 * via AES-256-GCM, and upserts the integrations row using the service-role
 * client (bypassing the deny-all RLS on the integrations table).
 *
 * All failure paths redirect to /dashboard/integrations with an `error`
 * query param so the UI can surface a useful message.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
): Promise<NextResponse> {
  const { provider: providerId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?next=/dashboard/integrations`, req.url)
    )
  }

  const provider = getProvider(providerId)
  if (!provider) return redirectToDashboard(req, { error: "unknown_provider" })
  if (provider.status !== "wired") {
    return redirectToDashboard(req, { error: "not_wired", provider: providerId })
  }

  const sp = req.nextUrl.searchParams
  const errorParam = sp.get("error")
  if (errorParam) {
    return redirectToDashboard(req, {
      error: errorParam,
      provider: providerId,
    })
  }

  const code = sp.get("code")
  const state = sp.get("state")
  if (!code || !state) {
    return redirectToDashboard(req, {
      error: "missing_code_or_state",
      provider: providerId,
    })
  }

  // Validate state cookie (CSRF)
  const cookieStore = await cookies()
  const cookieState = cookieStore.get(STATE_COOKIE_NAME)?.value
  if (!cookieState || cookieState !== state) {
    return redirectToDashboard(req, {
      error: "invalid_state",
      provider: providerId,
    })
  }

  // Decode state: "<user.id>:<providerId>:<nonce>"
  let decoded: string
  try {
    decoded = Buffer.from(state, "base64url").toString("utf8")
  } catch {
    return redirectToDashboard(req, {
      error: "malformed_state",
      provider: providerId,
    })
  }
  const [stateUserId, stateProviderId] = decoded.split(":")
  if (stateUserId !== user.id || stateProviderId !== providerId) {
    return redirectToDashboard(req, {
      error: "state_mismatch",
      provider: providerId,
    })
  }

  // One-time use: clear cookie before exchange so retries can't replay.
  cookieStore.delete(STATE_COOKIE_NAME)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL is not set" },
      { status: 500 }
    )
  }
  const redirectUri = `${siteUrl}/api/integrations/${providerId}/callback`

  let tokenResponse
  try {
    tokenResponse = await exchangeCodeForTokens(providerId, code, redirectUri)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "token exchange failed"
    return redirectToDashboard(req, {
      error: "token_exchange_failed",
      provider: providerId,
      detail: msg.slice(0, 100),
    })
  }

  // Encrypt tokens at rest
  const encAccess = encryptToken(tokenResponse.accessToken)
  const encRefresh = tokenResponse.refreshToken
    ? encryptToken(tokenResponse.refreshToken)
    : null

  // Upsert integrations row (service role bypasses RLS)
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const { error: upsertError } = await admin
    .from("integrations")
    .upsert(
      {
        client_id: user.id,
        provider: providerId,
        status: "connected",
        account_label: tokenResponse.accountLabel ?? null,
        scopes: tokenResponse.scopes,
        encrypted_access_token: encAccess,
        encrypted_refresh_token: encRefresh,
        connected_at: now,
        last_sync_at: null,
        error_message: null,
        updated_at: now,
      },
      { onConflict: "client_id,provider" }
    )

  if (upsertError) {
    return redirectToDashboard(req, {
      error: "db_upsert_failed",
      provider: providerId,
      detail: upsertError.message.slice(0, 100),
    })
  }

  // Audit log (best-effort; swallow failures to avoid masking the happy path)
  await admin.from("audit_log").insert({
    client_id: user.id,
    event_type: "integration.connected",
    description: `Connected ${provider.name}`,
    metadata: {
      provider: providerId,
      account_label: tokenResponse.accountLabel ?? null,
      scopes: tokenResponse.scopes,
    },
  })

  return redirectToDashboard(req, { connected: providerId })
}
