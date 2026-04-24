"use server"

import type {
  ImportWorkersInput,
  ImportWorkersResult,
  InviteTeamMemberInput,
  InviteTeamMemberResult,
} from "@/lib/types/onboarding"

export async function importWorkers(
  input: ImportWorkersInput,
): Promise<ImportWorkersResult> {
  const workerIds = input.workers.map((w) => w.id ?? crypto.randomUUID())
  const updatedCount = input.workers.filter((w) => Boolean(w.id)).length
  return {
    ok: true,
    data: {
      workerIds,
      createdCount: workerIds.length - updatedCount,
      updatedCount,
    },
  }
}

export async function inviteTeamMember(
  _input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult> {
  return {
    ok: true,
    data: { inviteTokenId: crypto.randomUUID(), magicLinkSent: true },
  }
}
