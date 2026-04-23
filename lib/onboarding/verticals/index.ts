/**
 * Onboarding vertical-config registry.
 *
 * Phase 1A ships 3 fully-configured verticals. Phase 1B adds Tier 1
 * (mining, waste_environmental) and Tier 2 (9 verticals). Tier 3 adds the
 * remaining 12 canonical slugs so every vertical in `VerticalSlug` now has
 * a researched config. Any slug not in the registry (and null/undefined)
 * still resolves to `DEFAULT_CONFIG`. Add a new vertical by:
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
// Tier 3 verticals
import { RETAIL_CONFIG } from './retail';
import { REAL_ESTATE_CONFIG } from './real-estate';
import { EDUCATION_CONFIG } from './education';
import { ARTS_ENTERTAINMENT_CONFIG } from './arts_entertainment';
import { PUBLIC_ADMIN_CONFIG } from './public_admin';
import { BUILDING_SERVICES_CONFIG } from './building_services';
import { FACILITIES_MGMT_CONFIG } from './facilities_mgmt';
import { INFORMATION_CONFIG } from './information';
import { PROFESSIONAL_SERVICES_CONFIG } from './professional_services';
import { BUSINESS_SUPPORT_CONFIG } from './business_support';
import { PERSONAL_SERVICES_CONFIG } from './personal_services';
import { SECURITY_CONFIG } from './security';
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
  // Tier 3
  retail: RETAIL_CONFIG,
  'real-estate': REAL_ESTATE_CONFIG,
  education: EDUCATION_CONFIG,
  arts_entertainment: ARTS_ENTERTAINMENT_CONFIG,
  public_admin: PUBLIC_ADMIN_CONFIG,
  building_services: BUILDING_SERVICES_CONFIG,
  facilities_mgmt: FACILITIES_MGMT_CONFIG,
  information: INFORMATION_CONFIG,
  professional_services: PROFESSIONAL_SERVICES_CONFIG,
  business_support: BUSINESS_SUPPORT_CONFIG,
  personal_services: PERSONAL_SERVICES_CONFIG,
  security: SECURITY_CONFIG,
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
  RETAIL_CONFIG,
  REAL_ESTATE_CONFIG,
  EDUCATION_CONFIG,
  ARTS_ENTERTAINMENT_CONFIG,
  PUBLIC_ADMIN_CONFIG,
  BUILDING_SERVICES_CONFIG,
  FACILITIES_MGMT_CONFIG,
  INFORMATION_CONFIG,
  PROFESSIONAL_SERVICES_CONFIG,
  BUSINESS_SUPPORT_CONFIG,
  PERSONAL_SERVICES_CONFIG,
  SECURITY_CONFIG,
};
export type { OnboardingVerticalConfig, VerticalSlug } from './types';
