"use server"

import type {
  RequestOnboardingPacketResult,
  UpsertThirdPartiesInput,
  UpsertThirdPartiesResult,
} from "@/lib/types/onboarding"

export async function upsertThirdParties(
  input: UpsertThirdPartiesInput,
): Promise<UpsertThirdPartiesResult> {
  const recordIds = input.records.map((r) => r.id ?? crypto.randomUUID())
  return { ok: true, data: { recordIds } }
}

export async function requestOnboardingPacket(
  _thirdPartyId: string,
): Promise<RequestOnboardingPacketResult> {
  return { ok: true, data: { tokenId: crypto.randomUUID() } }
}
