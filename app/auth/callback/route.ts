import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { safeRedirect } from "@/lib/safe-redirect"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeRedirect(searchParams.get("next"), "/v2/briefing")

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
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
