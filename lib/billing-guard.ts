"use server"

import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

/**
 * Billing guard — gates mutating server actions behind an active paid subscription.
 *
 * A user is "paid" when:
 *   1. They have an authenticated Supabase session, AND
 *   2. Their clients row has a non-null stripe_customer_id (proves checkout completed), AND
 *   3. Their clients.status is 'active' (subscription currently in good standing)
 *
 * Read-only actions (getters) should keep using getAuth() so users can see their data
 * even if billing lapses. Only mutations (insert/update/delete) should use this guard.
 *
 * Exempt flows by design: /dashboard/intake, /dashboard/settings (billing portal lives here),
 * alerts, partner-portal, auth flows, score funnel, samples/contact (pre-pay lead capture).
 */

export type PaywallCode = "UNAUTHENTICATED" | "NO_SUBSCRIPTION" | "SUBSCRIPTION_INACTIVE"

export type PaidAuthResult =
  | { supabase: ServerSupabase; clientId: string; user: User; error: null; message: null }
  | { supabase: null; clientId: null; user: null; error: PaywallCode; message: string }

const MESSAGES: Record<PaywallCode, string> = {
  UNAUTHENTICATED: "Please log in to continue.",
  NO_SUBSCRIPTION: "Active Protekon subscription required. Visit /pricing to get started.",
  SUBSCRIPTION_INACTIVE: "Your Protekon subscription is on hold. Update billing in Settings to continue.",
}

export async function requirePaidAuth(): Promise<PaidAuthResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase: null, clientId: null, user: null, error: "UNAUTHENTICATED", message: MESSAGES.UNAUTHENTICATED }
  }

  const { data: client } = await supabase
    .from("clients")
    .select("stripe_customer_id, status")
    .eq("id", user.id)
    .maybeSingle()

  if (!client?.stripe_customer_id) {
    return { supabase: null, clientId: null, user: null, error: "NO_SUBSCRIPTION", message: MESSAGES.NO_SUBSCRIPTION }
  }

  if (client.status !== "active") {
    return { supabase: null, clientId: null, user: null, error: "SUBSCRIPTION_INACTIVE", message: MESSAGES.SUBSCRIPTION_INACTIVE }
  }

  return { supabase, clientId: user.id, user, error: null, message: null }
}
