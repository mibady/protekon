"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/roles"
import {
  listProviders,
  getProvider,
  type ProviderConfig,
  type ProviderStatus,
} from "@/lib/integrations/registry"

export type IntegrationRow = ProviderConfig & {
  connected: boolean
  status: ProviderStatus // "wired" | "coming_soon" (from registry)
  connectionState: "connected" | "disconnected" | "error" | null
  connectedAt: string | null
  lastSyncAt: string | null
  accountLabel: string | null
  errorMessage: string | null
}

export type ActionResult = { success?: boolean; error?: string }

type IntegrationDbRow = {
  provider: string
  status: string
  account_label: string | null
  connected_at: string | null
  last_sync_at: string | null
  error_message: string | null
}

/**
 * Returns every registered provider annotated with the current connection state
 * for the calling client. Never returns decrypted tokens.
 */
export async function listIntegrations(): Promise<IntegrationRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const providers = listProviders()
  if (!user) {
    return providers.map((p) => ({
      ...p,
      connected: false,
      connectionState: null,
      connectedAt: null,
      lastSyncAt: null,
      accountLabel: null,
      errorMessage: null,
    }))
  }

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from("integrations")
    .select("provider, status, account_label, connected_at, last_sync_at, error_message")
    .eq("client_id", user.id)

  const byProvider = new Map<string, IntegrationDbRow>()
  for (const r of (rows ?? []) as IntegrationDbRow[]) {
    byProvider.set(r.provider, r)
  }

  return providers.map((p) => {
    const row = byProvider.get(p.id)
    return {
      ...p,
      connected: row?.status === "connected",
      connectionState:
        (row?.status as IntegrationRow["connectionState"] | undefined) ?? null,
      connectedAt: row?.connected_at ?? null,
      lastSyncAt: row?.last_sync_at ?? null,
      accountLabel: row?.account_label ?? null,
      errorMessage: row?.error_message ?? null,
    }
  })
}

/**
 * Disconnects a provider — nulls tokens + marks row disconnected.
 * Owner-only.
 */
export async function disconnectIntegration(provider: string): Promise<ActionResult> {
  let resolved
  try {
    resolved = await requireRole(["owner"])
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Forbidden." }
  }

  const p = getProvider(provider)
  if (!p) return { error: `Unknown provider: ${provider}` }

  const admin = createAdminClient()
  const { error } = await admin
    .from("integrations")
    .update({
      status: "disconnected",
      encrypted_access_token: null,
      encrypted_refresh_token: null,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("client_id", resolved.clientId)
    .eq("provider", provider)

  if (error) return { error: error.message }

  // Audit log
  await admin.from("audit_log").insert({
    client_id: resolved.clientId,
    event_type: "integration.disconnected",
    description: `Disconnected ${p.name}`,
    metadata: { provider },
  })

  return { success: true }
}
