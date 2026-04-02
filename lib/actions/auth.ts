"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ActionResult } from "@/lib/types"

export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
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
  }

  redirect("/dashboard/intake")
}

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/dashboard/settings`,
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
