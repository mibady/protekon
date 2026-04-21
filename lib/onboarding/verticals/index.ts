/**
 * Onboarding vertical-config registry.
 *
 * Phase 1A ships 3 fully-configured verticals. Any vertical not in the
 * registry (and null/undefined) resolves to `DEFAULT_CONFIG`. Add a new
 * vertical by:
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
import type { OnboardingVerticalConfig, VerticalSlug } from './types';

const REGISTRY: Partial<Record<VerticalSlug, OnboardingVerticalConfig>> = {
  construction: CONSTRUCTION_CONFIG,
  manufacturing: MANUFACTURING_CONFIG,
  healthcare: HEALTHCARE_CONFIG,
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
};
export type { OnboardingVerticalConfig, VerticalSlug } from './types';
