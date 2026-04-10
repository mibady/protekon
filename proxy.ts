import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/partner/:path*",
    "/((?!api/inngest|api/stripe/webhook|api/score/submit|api/samples/gate|api/contact|api/partners/apply)api/:path*)",
  ],
}
