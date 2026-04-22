/**
 * Canonical mapping of wizard integration keys → `integrations.provider` text.
 * `integrations.provider` is free-form text (no enum in DB) so we keep the
 * canonical strings here to avoid drift between wizard UI and DB values.
 */

import type { IntegrationProviderKey } from "@/lib/types/onboarding"

export const INTEGRATION_PROVIDERS: Record<IntegrationProviderKey, string> = {
  gmail: "gmail",
  outlook: "outlook",
  google_drive: "google_drive",
  onedrive: "onedrive",
  dropbox: "dropbox",
  quickbooks: "quickbooks",
  sage_intacct: "sage_intacct",
  foundation: "foundation",
  mycoi: "mycoi",
  evident: "evident",
  procore: "procore",
  billy: "billy",
}

export function isIntegrationProviderKey(
  value: string,
): value is IntegrationProviderKey {
  return value in INTEGRATION_PROVIDERS
}
