"use server"

import type {
  ActionResult,
  UpsertSitesInput,
  UpsertSitesResult,
} from "@/lib/types/onboarding"

export async function upsertSites(
  input: UpsertSitesInput,
): Promise<UpsertSitesResult> {
  const siteIds = input.sites.map((s) => s.id ?? crypto.randomUUID())
  const primary = input.sites.findIndex((s) => s.isPrimary)
  return {
    ok: true,
    data: {
      siteIds,
      primarySiteId: primary >= 0 ? siteIds[primary] : null,
    },
  }
}

export async function deleteSite(_id: string): Promise<ActionResult> {
  return { ok: true, data: undefined }
}
