/**
 * PII sensitivity gate for v2 Coverage surfaces.
 *
 * Some verticals handle workers whose personal identifying data is regulated
 * or privileged (HIPAA patient-adjacent staff, licensed professionals whose
 * identities carry separate disclosure rules). For those verticals we render
 * the team drill-down in *role-only* mode — the row heading is the role, not
 * the person's name — and suppress direct identifiers in the detail pane.
 *
 * This is a v1 heuristic, not a compliance claim. When the customer confirms
 * a consent posture we can flip this per-client via a column on `clients`.
 */

const PII_SENSITIVE_VERTICALS = new Set<string>([
  "healthcare",
  "professional_services",
])

export function shouldRedactPII(vertical: string | null | undefined): boolean {
  if (!vertical) return false
  return PII_SENSITIVE_VERTICALS.has(vertical)
}
