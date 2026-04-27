import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getSiteUrl } from "@/lib/resend"
import { welcomeEmail } from "@/lib/email-templates"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  let email: string
  try {
    const body = await request.json()
    email = String(body?.email ?? "").trim().toLowerCase()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 })
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Find auth user by email. listUsers paginates; scan up to 5 pages × 200 = 1000 users.
  let foundUser: { id: string; email?: string | null } | null = null
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) break
    foundUser = data.users.find((u) => u.email?.toLowerCase() === email) ?? null
    if (foundUser) break
    if ((data.users?.length ?? 0) < 200) break
  }

  // Never leak account existence — always return ok: true even if not found.
  if (!foundUser) {
    return NextResponse.json({ ok: true })
  }

  let loginUrl: string | undefined
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${getSiteUrl()}/dashboard` },
    })
    if (!error) loginUrl = data?.properties?.action_link ?? undefined
  } catch {
    // generateLink failure falls through to welcomeEmail() default CTA
  }

  try {
    await sendEmail({ to: email, ...welcomeEmail(email, loginUrl) })
  } catch (err) {
    console.error("[resend-welcome] sendEmail failed:", err)
    return NextResponse.json({ ok: false, error: "Could not send email — try again in a minute." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
