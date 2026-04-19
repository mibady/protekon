/**
 * RoleBadge — PriorityPill tone map for UserRole.
 * owner → enforcement (red), compliance_manager → sand, field_lead → steel, auditor → steel.
 */
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { UserRole } from "@/lib/auth/roles"

type RoleBadgeProps = {
  role: UserRole
}

const ROLE_TONE: Record<UserRole, "enforcement" | "sand" | "steel"> = {
  owner: "enforcement",
  compliance_manager: "sand",
  field_lead: "steel",
  auditor: "steel",
}

const ROLE_LABEL: Record<UserRole, string> = {
  owner: "OWNER",
  compliance_manager: "COMPLIANCE MANAGER",
  field_lead: "FIELD LEAD",
  auditor: "AUDITOR",
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <PriorityPill tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</PriorityPill>
}
