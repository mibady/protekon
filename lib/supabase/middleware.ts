import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — always use getUser() not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Bypass auth redirect for Meticulous test replays
  const isMeticulousTest = request.headers.get("meticulous-is-test") === "1"

  // Redirect unauthenticated users from protected routes
  if (
    !user &&
    !isMeticulousTest &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
     request.nextUrl.pathname === "/partner" ||
     request.nextUrl.pathname.startsWith("/partner/"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
