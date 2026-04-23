/**
 * Onboarding vertical-config registry.
 *
 * Phase 1A ships 3 fully-configured verticals. Phase 1B adds Tier 1
 * (mining, waste_environmental) and Tier 2 (9 verticals). Any vertical not
 * in the registry (and null/undefined) resolves to `DEFAULT_CONFIG`. Add a
 * new vertical by:
 *   1. creating `lib/onboarding/verticals/<slug>.ts` that exports a
 *      typed `<SLUG>_CONFIG: OnboardingVerticalConfig`,
 *   2. importing + registering it below.
 *
 * This is a code → DB one-way sync per `docs/TEMPLATE-ARCHITECTURE.md`; no
 * DB query runs during wizard navigation.
 */

import { DEFAULT_CONFIG } from './default';
import { CONSTRUCTION_CONFIG } from './construction';
import { MANUFACTURING_CONFIG } from './manufacturing';
import { HEALTHCARE_CONFIG } from './healthcare';
import { MINING_CONFIG } from './mining';
import { WASTE_ENVIRONMENTAL_CONFIG } from './waste_environmental';
// Tier 2 verticals (Phase 1B)
import { HOSPITALITY_CONFIG } from './hospitality';
import { AGRICULTURE_CONFIG } from './agriculture';
import { TRANSPORTATION_CONFIG } from './transportation';
import { AUTO_SERVICES_CONFIG } from './auto-services';
import { WHOLESALE_CONFIG } from './wholesale';
import { UTILITIES_CONFIG } from './utilities';
import { EQUIPMENT_REPAIR_CONFIG } from './equipment_repair';
import { LAUNDRY_CONFIG } from './laundry';
import { STAFFING_CONFIG } from './staffing';
import type { OnboardingVerticalConfig, VerticalSlug } from './types';

const REGISTRY: Partial<Record<VerticalSlug, OnboardingVerticalConfig>> = {
  construction: CONSTRUCTION_CONFIG,
  manufacturing: MANUFACTURING_CONFIG,
  healthcare: HEALTHCARE_CONFIG,
  mining: MINING_CONFIG,
  waste_environmental: WASTE_ENVIRONMENTAL_CONFIG,
  // Tier 2 (Phase 1B)
  hospitality: HOSPITALITY_CONFIG,
  agriculture: AGRICULTURE_CONFIG,
  transportation: TRANSPORTATION_CONFIG,
  'auto-services': AUTO_SERVICES_CONFIG,
  wholesale: WHOLESALE_CONFIG,
  utilities: UTILITIES_CONFIG,
  equipment_repair: EQUIPMENT_REPAIR_CONFIG,
  laundry: LAUNDRY_CONFIG,
  staffing: STAFFING_CONFIG,
};

/**
 * Resolve the onboarding config for a vertical slug.
 *
 * Falls back to `DEFAULT_CONFIG` when the slug is null, undefined, or not
 * yet configured. This is the ONLY supported way to read a vertical config
 * from application code.
 */
export function getOnboardingConfig(
  slug: VerticalSlug | null | undefined,
): OnboardingVerticalConfig {
  if (!slug) return DEFAULT_CONFIG;
  return REGISTRY[slug] ?? DEFAULT_CONFIG;
}

export {
  DEFAULT_CONFIG,
  CONSTRUCTION_CONFIG,
  MANUFACTURING_CONFIG,
  HEALTHCARE_CONFIG,
  MINING_CONFIG,
  WASTE_ENVIRONMENTAL_CONFIG,
  HOSPITALITY_CONFIG,
  AGRICULTURE_CONFIG,
  TRANSPORTATION_CONFIG,
  AUTO_SERVICES_CONFIG,
  WHOLESALE_CONFIG,
  UTILITIES_CONFIG,
  EQUIPMENT_REPAIR_CONFIG,
  LAUNDRY_CONFIG,
  STAFFING_CONFIG,
};
export type { OnboardingVerticalConfig, VerticalSlug } from './types';
