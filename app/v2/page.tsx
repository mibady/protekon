import { redirect } from "next/navigation"

/**
 * /v2 is not a destination — it's a route namespace. Always redirect to Briefing.
 * Briefing is the canonical home screen per the redesign IA.
 */
export default function V2RootPage() {
  redirect("/v2/briefing")
}
