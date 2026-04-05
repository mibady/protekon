import { updateSession } from "@/lib/supabase/middleware"

export const middleware = updateSession

export const config = {
  matcher: ["/dashboard/:path*", "/partner/:path*"],
}
