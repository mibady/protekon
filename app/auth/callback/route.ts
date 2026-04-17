import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { safeRedirect } from "@/lib/safe-redirect"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // Honor ?next= only if explicitly supplied AND safe. Empty fallback
  // distinguishes "no next" (fall through to v2 routing) from an
  // attacker-supplied external URL (rejected by safeRedirect).
  const nextParam = searchParams.get("next")
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

        // Route v2 clients straight to /v2/briefing. maybeSingle so
        // partners/admins without a client row fall through to /dashboard.
        const { data: client } = await supabase
          .from("clients")
          .select("v2_enabled")
          .eq("id", user.id)
          .maybeSingle()

        if (client?.v2_enabled) {
          return NextResponse.redirect(`${origin}/v2/briefing`)
        }
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
