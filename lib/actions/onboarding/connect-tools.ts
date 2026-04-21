"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  INTEGRATION_PROVIDERS,
  isIntegrationProviderKey,
} from "@/lib/onboarding/integration-providers"
import type {
  IntegrationProviderKey,
  ToolIntentResult,
} from "@/lib/types/onboarding"

/**
 * Step 2: capture opt-in intent for a future Phase 2 integration.
 *
 * `integrations` has deny-all RLS to authenticated roles, so all reads/writes
 * use the service-role client. RLS scoping is enforced by caller auth +
 * `eq('client_id', user.id)` on the unique constraint.
 */
export async function recordToolIntent(
  providerKey: IntegrationProviderKey,
): Promise<ToolIntentResult> {
  if (!isIntegrationProviderKey(providerKey)) {
    return { ok: false, error: "unknown_provider" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { ok: false, error: "unauthenticated" }
  }

  const admin = createAdminClient()
  const provider = INTEGRATION_PROVIDERS[providerKey]

  const { data, error } = await admin
    .from("integrations")
    .upsert(
      {
        client_id: user.id,
        provider,
        status: "disconnected",
        account_label: "requested",
        connected_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id,provider" },
    )
    .select("id")
    .single<{ id: string }>()

  if (error || !data) {
    return { ok: false, error: error?.message ?? "upsert_failed" }
  }

  return { ok: true, data: { integrationId: data.id } }
}
