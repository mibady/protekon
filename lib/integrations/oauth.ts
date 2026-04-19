import { getProvider, type ProviderConfig } from "./registry"

export type TokenResponse = {
  accessToken: string
  refreshToken: string | null
  scopes: string[]
  expiresInSec: number | null
  accountLabel: string | null
  rawPayload: Record<string, unknown>
}

function assertEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Environment variable ${name} is not set`)
  return v
}

function assertWired(
  provider: ProviderConfig
): asserts provider is ProviderConfig & {
  authorizeUrl: string
  tokenUrl: string
  scopes: string[]
  clientIdEnv: string
  clientSecretEnv: string
} {
  if (provider.status !== "wired") {
    throw new Error(`Provider ${provider.id} is not wired for OAuth`)
  }
  if (
    !provider.authorizeUrl ||
    !provider.tokenUrl ||
    !provider.scopes ||
    !provider.clientIdEnv ||
    !provider.clientSecretEnv
  ) {
    throw new Error(`Provider ${provider.id} is misconfigured (missing OAuth fields)`)
  }
}

/**
 * Builds the provider's authorize URL. Caller is responsible for generating
 * the state parameter and redirecting the browser here.
 */
export function buildAuthorizeUrl(
  providerId: string,
  state: string,
  redirectUri: string
): string {
  const p = getProvider(providerId)
  if (!p) throw new Error(`Unknown provider: ${providerId}`)
  assertWired(p)

  const clientId = assertEnv(p.clientIdEnv)
  const url = new URL(p.authorizeUrl)
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", p.scopes.join(" "))
  url.searchParams.set("state", state)
  if (p.extraAuthorizeParams) {
    for (const [k, v] of Object.entries(p.extraAuthorizeParams)) {
      url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

/**
 * Exchanges an authorization code for access + refresh tokens.
 * Normalizes the response into a common TokenResponse shape; provider-specific
 * fields (like Slack's team.name) are surfaced as accountLabel when available.
 */
export async function exchangeCodeForTokens(
  providerId: string,
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const p = getProvider(providerId)
  if (!p) throw new Error(`Unknown provider: ${providerId}`)
  assertWired(p)

  const clientId = assertEnv(p.clientIdEnv)
  const clientSecret = assertEnv(p.clientSecretEnv)

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(p.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed (${res.status}): ${text.slice(0, 500)}`)
  }

  const payload = (await res.json()) as Record<string, unknown>

  // Slack returns { ok: true, ... }; DocuSign and standard OAuth2 return access_token directly.
  if (payload.ok === false) {
    throw new Error(
      `Provider returned not-ok: ${JSON.stringify(payload).slice(0, 500)}`
    )
  }

  const accessToken = (payload.access_token ?? payload.accessToken) as string | undefined
  if (!accessToken) {
    throw new Error(
      `Provider response missing access_token: ${JSON.stringify(payload).slice(0, 200)}`
    )
  }
  const refreshToken = (payload.refresh_token ?? payload.refreshToken ?? null) as
    | string
    | null
  const scope = (payload.scope ?? "") as string
  const scopes =
    typeof scope === "string" && scope.length > 0
      ? scope.split(/[ ,]+/).filter(Boolean)
      : p.scopes ?? []
  const expiresInSec = typeof payload.expires_in === "number" ? payload.expires_in : null

  // Account label heuristics
  let accountLabel: string | null = null
  const team = payload.team as { name?: string } | undefined
  if (team?.name) accountLabel = team.name
  const authedUser = payload.authed_user as { id?: string } | undefined
  if (!accountLabel && authedUser?.id) accountLabel = `user ${authedUser.id}`

  return {
    accessToken,
    refreshToken,
    scopes,
    expiresInSec,
    accountLabel,
    rawPayload: payload,
  }
}
