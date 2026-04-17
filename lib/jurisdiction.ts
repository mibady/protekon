/**
 * Jurisdiction-aware template resolver (Phase 3 / P3-5).
 *
 * Pure functions — no I/O. Callers (document generator) fetch the override
 * row from `template_jurisdiction_overrides` and pass it in.
 *
 * Two transforms:
 *   1. sections_override replaces base sections entirely (when present).
 *   2. legal_ref_swap does a literal string-replace pass on every section's
 *      `purpose` and `requiredReferences` — e.g. "Cal/OSHA" → "OSHA".
 */
import type { SectionTemplate } from "@/lib/document-templates"

export type Jurisdiction =
  | "ca"
  | "federal"
  | "ct"
  | "md"
  | "mn"
  | "nj"
  | "wa"
  | "tx"
  | "va"
  | "mi"
  | "or"

export interface JurisdictionOverride {
  template_id: string
  jurisdiction: Jurisdiction
  sections_override: SectionTemplate[] | null
  legal_ref_swap: Record<string, string>
  notes?: string | null
}

/** States with their own OSHA state plan that Protekon supports explicitly. */
const STATE_PLAN_CODES: Record<string, Jurisdiction> = {
  CA: "ca",
  CT: "ct",
  MD: "md",
  MN: "mn",
  NJ: "nj",
  WA: "wa",
  VA: "va",
  MI: "mi",
  OR: "or",
  TX: "tx",
}

/**
 * Map a client's state (2-letter USPS code) to a Jurisdiction.
 * Null/unknown defaults to "ca" (home-court default for backwards compat).
 * States not in STATE_PLAN_CODES map to "federal".
 */
export function stateToJurisdiction(state: string | null | undefined): Jurisdiction {
  if (!state) return "ca"
  const code = state.trim().toUpperCase()
  return STATE_PLAN_CODES[code] ?? "federal"
}

/**
 * Apply a single legal-ref swap map to a string. Longest keys first so
 * "Cal/OSHA Title 8" wins over "Cal/OSHA" when both match.
 */
function swapRefs(input: string, swap: Record<string, string>): string {
  if (!input) return input
  const keys = Object.keys(swap).sort((a, b) => b.length - a.length)
  let out = input
  for (const k of keys) {
    if (out.includes(k)) {
      out = out.split(k).join(swap[k])
    }
  }
  return out
}

/**
 * Transform a section through the legal_ref_swap map.
 * Only `purpose` and `requiredReferences` are touched — heading is preserved
 * because PDF tests lock headings.
 */
function swapSectionRefs(
  section: SectionTemplate,
  swap: Record<string, string>,
): SectionTemplate {
  if (Object.keys(swap).length === 0) return section
  return {
    ...section,
    purpose: swapRefs(section.purpose, swap),
    requiredReferences: section.requiredReferences.map((ref) => swapRefs(ref, swap)),
  }
}

/**
 * Apply a jurisdiction override to a base set of sections.
 *
 * - If override is null → return base unchanged.
 * - If override.sections_override is non-null → replace base with override.
 * - Always run legal_ref_swap over the resulting sections.
 */
export function applyJurisdictionOverride(
  baseSections: SectionTemplate[],
  override: JurisdictionOverride | null,
): SectionTemplate[] {
  if (!override) return baseSections
  const starting = override.sections_override ?? baseSections
  const swap = override.legal_ref_swap ?? {}
  return starting.map((s) => swapSectionRefs(s, swap))
}

/**
 * Resolve the full document template for a jurisdiction. Callers fetch the
 * override row (or null) and pass it alongside the base DocumentTemplate.
 *
 * Returns a new sections array; the base template is not mutated.
 */
export function resolveTemplateSections(
  baseSections: SectionTemplate[],
  override: JurisdictionOverride | null,
): SectionTemplate[] {
  return applyJurisdictionOverride(baseSections, override)
}
