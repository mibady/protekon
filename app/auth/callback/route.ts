import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { safeRedirect } from "@/lib/safe-redirect"
import { resolveLandingPath } from "@/lib/auth/landing"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next")
  // Honor explicit ?next= only when supplied + safe. Empty string
  // distinguishes "no next" from "explicit /dashboard".
  const explicitNext = nextParam ? safeRedirect(nextParam, "") : ""

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Re-engagement tracking — fire-and-forget.
        await supabase
          .from("clients")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id)

        if (explicitNext) {
          return NextResponse.redirect(`${origin}${explicitNext}`)
        }

        // Role-aware landing — partners → /partner, clients → /dashboard.
        const landing = await resolveLandingPath(supabase, user.id, user.email)
        return NextResponse.redirect(`${origin}${landing}`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
