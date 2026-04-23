import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getProvider } from "@/lib/integrations/registry"
import { buildAuthorizeUrl } from "@/lib/integrations/oauth"

const STATE_COOKIE_NAME = "integrations_oauth_state"
const STATE_COOKIE_MAX_AGE = 15 * 60 // 15 minutes

/**
 * GET — kick off OAuth Authorization Code flow for `providerId`.
 * Requires an authenticated session. Generates a CSRF state bound to
 * userId + providerId + nonce, stores it in an httpOnly cookie, and
 * redirects the browser to the provider's authorize URL.
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
      new URL(
        `/login?next=${encodeURIComponent(
          `/api/integrations/${providerId}/authorize`
        )}`,
        req.url
      )
    )
  }

  const provider = getProvider(providerId)
  if (!provider) {
    return NextResponse.json(
      { error: `Unknown provider: ${providerId}` },
      { status: 404 }
    )
  }
  if (provider.status !== "wired") {
    return NextResponse.redirect(
      new URL(
        `/dashboard/integrations?error=not_wired&provider=${providerId}`,
        req.url
      )
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL is not set" },
      { status: 500 }
    )
  }
  const redirectUri = `${siteUrl}/api/integrations/${providerId}/callback`

  // CSRF state: "<user.id>:<providerId>:<nonce>" encoded as base64url.
  const nonce = crypto.randomBytes(16).toString("hex")
  const stateValue = `${user.id}:${providerId}:${nonce}`
  const state = Buffer.from(stateValue).toString("base64url")

  let authorizeUrl: string
  try {
    authorizeUrl = buildAuthorizeUrl(providerId, state, redirectUri)
  } catch (e) {
    console.error(
      `[GET /api/integrations/${providerId}/authorize] buildAuthorizeUrl failed:`,
      e
    )
    return NextResponse.json(
      { error: "Unable to start integration. Please try again." },
      { status: 500 }
    )
  }

  const cookieStore = await cookies()
  cookieStore.set({
    name: STATE_COOKIE_NAME,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_COOKIE_MAX_AGE,
  })

  return NextResponse.redirect(authorizeUrl)
}
