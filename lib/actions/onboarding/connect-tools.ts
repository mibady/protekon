"use server"

import type {
  IntegrationProviderKey,
  ToolIntentResult,
} from "@/lib/types/onboarding"

export async function recordToolIntent(
  _providerKey: IntegrationProviderKey,
): Promise<ToolIntentResult> {
  return { ok: true, data: { integrationId: crypto.randomUUID() } }
}
