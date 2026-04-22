#!/usr/bin/env tsx
/**
 * Resets an account's onboarding state so the wizard can be walked end-to-end again.
 *
 * Usage:
 *   npx tsx scripts/reset-onboarding.ts <email>
 *   npx tsx scripts/reset-onboarding.ts admin@coastalhealthgroup.com
 *
 * What it does:
 *   1. Finds the clients row by email.
 *   2. Deletes this client's rows from every table that FK-references
 *      public.sites (so sites can be deleted last) plus construction_subs.
 *      Tables that don't exist in prod are skipped silently.
 *   3. Resets the clients row's resettable onboarding fields.
 *
 * What it does NOT touch:
 *   - The clients row itself (preserves id, email, stripe_customer_id, plan, partner_id).
 *   - The Supabase Auth user (login keeps working).
 *   - clients.vertical — prod schema has NOT NULL on this column with no default,
 *     so it can't be nulled. Step 1 will pre-fill with the prior value; users can
 *     change it if they want to test picking a different industry.
 *   - business_name — kept so the demo doesn't lose its display name.
 *   - integrations / user_roles — these tables don't exist in prod yet
 *     (Phase 1B migrations 047/050 unapplied). Add them to the delete list
 *     once those migrations land.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  )
  process.exit(1)
}

const email = process.argv[2]
if (!email) {
  console.error("Usage: npx tsx scripts/reset-onboarding.ts <email>")
  process.exit(1)
}

const supabase = createClient(url, key)

// Order matters: everything that FK-references sites goes first so the
// sites delete at the end doesn't hit a foreign-key violation.
const DELETE_ORDER = [
  "incidents",
  "training_records",
  "alerts",
  "employee_log_requests",
  "materials",
  "team_members",
  "assets",
  "inspections",
  "permits",
  "findings",
  "documents",
  "workers",
  "construction_subs",
  "sites",
] as const

async function main() {
  const { data: client, error: findErr } = await supabase
    .from("clients")
    .select(
      "id, email, business_name, onboarding_status, last_onboarding_step_completed",
    )
    .eq("email", email)
    .maybeSingle()

  if (findErr || !client) {
    console.error(
      `No client found with email ${email}:`,
      findErr?.message ?? "not found",
    )
    process.exit(1)
  }

  console.log(`Target: ${client.id}`)
  console.log(`  email:         ${client.email}`)
  console.log(`  business_name: ${client.business_name ?? "<none>"}`)
  console.log(`  status before: ${client.onboarding_status}`)
  console.log(`  step before:   ${client.last_onboarding_step_completed}`)
  console.log()

  const clientId = client.id

  for (const table of DELETE_ORDER) {
    const { error, count } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .eq("client_id", clientId)
    if (error) {
      // Ignore "table doesn't exist" (42P01) and "column doesn't exist" (42703) —
      // prod schema may be missing some tables that the code paths use. Log
      // other errors so the user knows what didn't clean up.
      const skippable = error.code === "42P01" || error.code === "42703"
      const marker = skippable ? "skipped" : "error"
      console.log(`  [${table}] ${marker}: ${error.message}`)
    } else {
      console.log(`  [${table}] deleted ${count ?? 0} rows`)
    }
  }

  const { error: updateErr } = await supabase
    .from("clients")
    .update({
      onboarding_status: "not_started",
      last_onboarding_step_completed: 0,
      onboarded_at: null,
      operating_states: [],
      worker_count_range: null,
      vertical_metadata: {},
    })
    .eq("id", clientId)

  if (updateErr) {
    console.error(`  [clients] update error: ${updateErr.message}`)
    process.exit(1)
  }

  console.log(`  [clients] reset onboarding fields`)
  console.log()
  console.log(`Done. ${email} can now walk the wizard from Step 1.`)
  console.log(`Note: vertical is preserved (NOT NULL column). Step 1 will pre-fill it.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
