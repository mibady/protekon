"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ActionResult } from "@/lib/types"
import { safeRedirect } from "@/lib/safe-redirect"
import { resolveLandingPath } from "@/lib/auth/landing"
import { inngest } from "@/inngest/client"

export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const nextParam = formData.get("next") as string | null
  // Honor ?next= only if the caller explicitly supplied a safe one.
  // Empty string distinguishes "no next" from "explicit /dashboard".
  const explicitNext = nextParam ? safeRedirect(nextParam, "") : ""

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (explicitNext) {
    redirect(explicitNext)
  }

  // Role-aware landing — partners → /partner, clients → /dashboard
  // (which rewrites to v2 content), neither → unauthorized.
  if (data.user) {
    const landing = await resolveLandingPath(
      supabase,
      data.user.id,
      data.user.email
    )
    redirect(landing)
  }

  redirect("/dashboard")
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const businessName = formData.get("businessName") as string
  const vertical = formData.get("vertical") as string
  const plan = formData.get("plan") as string
  const locationCount = parseInt(formData.get("locationCount") as string) || 1

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName,
        vertical,
        plan,
        location_count: locationCount,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create client record so dashboard has data immediately
  if (data.user) {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const admin = createAdminClient()
    await admin.from("clients").upsert({
      id: data.user.id,
      email,
      business_name: businessName,
      vertical: vertical || "other",
      plan: plan || "core",
      compliance_score: 0,
      risk_level: "high",
      status: "active",
    }, { onConflict: "id" })

    // Fire the post-signup durable workflow (welcome email + reminder seeding).
    // Never block signup on Inngest dispatch — if the event key is missing or
    // the service is unreachable, the user should still land on onboarding.
    try {
      await inngest.send({
        name: "auth/user.signed-up",
        data: { userId: data.user.id, email },
      })
    } catch (err) {
      // Never block signup on welcome-workflow dispatch
      console.error("[auth/user.signed-up] inngest dispatch failed:", err)
    }
  }

  redirect("/onboarding/business")
}

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/dashboard`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
