import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { PeopleForm } from "@/components/onboarding/step-4-people/PeopleForm"
import type { TeamMemberRole } from "@/lib/types/onboarding"

type UserRoleRow = {
  email: string | null
  role: string | null
}

const ROLES: TeamMemberRole[] = [
  "owner",
  "compliance_manager",
  "field_lead",
  "auditor",
]

function asTeamRole(value: string | null): TeamMemberRole | null {
  if (!value) return null
  return ROLES.includes(value as TeamMemberRole) ? (value as TeamMemberRole) : null
}

export default async function PeoplePage() {
  const stateResult = await getOnboardingState()
  if (!stateResult.ok) redirect("/login?next=/onboarding/people")
  if (stateResult.data.currentStep === 0) redirect("/onboarding/business")

  const state = stateResult.data

  const supabase = await createClient()
  const { data: invites } = await supabase
    .from("user_roles")
    .select("email, role")
    .eq("client_id", state.client.id)
    .returns<UserRoleRow[]>()

  const initialInvites = (invites ?? [])
    .map((row) => {
      const role = asTeamRole(row.role)
      if (!row.email || !role) return null
      return { email: row.email, role }
    })
    .filter((v): v is { email: string; role: TeamMemberRole } => v !== null)

  return (
    <PeopleForm
      workerSingular={state.config.peopleTerminology.worker}
      workerPlural={`${state.config.peopleTerminology.worker}s`}
      importHelp={state.config.stepCopy.people.workerImportHelp}
      stepIntro={state.config.stepCopy.people.intro}
      initialInvites={initialInvites}
    />
  )
}
