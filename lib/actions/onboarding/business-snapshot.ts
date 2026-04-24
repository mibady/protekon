"use server"

import type {
  BusinessSnapshotInput,
  BusinessSnapshotResult,
} from "@/lib/types/onboarding"

export async function submitBusinessSnapshot(
  _input: BusinessSnapshotInput,
): Promise<BusinessSnapshotResult> {
  return { ok: true, data: { clientId: "stub-client-id", nextStep: 2 } }
}
