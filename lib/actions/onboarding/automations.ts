"use server"

import type {
  ConfigureAutomationsInput,
  ConfigureAutomationsResult,
  ScheduleInitialActionsInput,
  ScheduleInitialActionsResult,
} from "@/lib/types/onboarding"

export async function configureAutomations(
  input: ConfigureAutomationsInput,
): Promise<ConfigureAutomationsResult> {
  return {
    ok: true,
    data: { verticalMetadata: { automations: input.toggles } },
  }
}

export async function scheduleInitialActions(
  input: ScheduleInitialActionsInput,
): Promise<ScheduleInitialActionsResult> {
  return {
    ok: true,
    data: { scheduledIds: input.actions.map(() => crypto.randomUUID()) },
  }
}
