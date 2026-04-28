import type { SupabaseClient } from "@supabase/supabase-js"
import Stripe from "stripe"

import { findAuthUserByEmail } from "./supabase-admin"

/**
 * Removes everything the customer-journey test created so the next run can
 * use a fresh email. Models the cleanup pattern from
 * `scripts/seed-demo-v2.ts cleanAll()`.
 *
 * Errors are collected, not thrown — partial cleanup is better than skipped
 * cleanup. The test reports any leftover.
 */
export async function cleanupJourneyTestUser(
  admin: SupabaseClient,
  stripe: Stripe,
  email: string,
): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = []

  const user = await findAuthUserByEmail(admin, email)
  if (user) {
    // Tables that don't cascade from clients delete — clear them first.
    for (const tbl of ["user_roles", "team_invite_tokens", "audit_log"]) {
      const { error } = await admin.from(tbl).delete().eq("client_id", user.id)
      if (error && !error.message.includes("violates foreign key")) {
        // user_roles uses user_id, audit_log uses client_id — try both.
        const alt = await admin.from(tbl).delete().eq("user_id", user.id)
        if (alt.error) errors.push(`${tbl}: ${alt.error.message}`)
      }
    }

    const { error: clientErr } = await admin.from("clients").delete().eq("id", user.id)
    if (clientErr) errors.push(`clients: ${clientErr.message}`)

    const { error: authErr } = await admin.auth.admin.deleteUser(user.id)
    if (authErr) errors.push(`auth.users: ${authErr.message}`)
  }

  // Stripe customers — there may be multiple from retries.
  try {
    const customers = await stripe.customers.list({ email, limit: 10 })
    for (const customer of customers.data) {
      try {
        await stripe.customers.del(customer.id)
      } catch (err) {
        errors.push(`stripe.customers.del(${customer.id}): ${(err as Error).message}`)
      }
    }
  } catch (err) {
    errors.push(`stripe.customers.list: ${(err as Error).message}`)
  }

  return { ok: errors.length === 0, errors }
}

export function getJourneyStripe(): Stripe {
  const key = process.env.JOURNEY_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("Journey test requires JOURNEY_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY")
  }
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" })
}
