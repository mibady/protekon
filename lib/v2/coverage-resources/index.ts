import type { Icon } from "@phosphor-icons/react/dist/lib/types"
import type { ResourceConfig, ResourceType } from "@/lib/v2/coverage-types"
import { sitesConfig, sitesIcon } from "./sites"
import { teamConfig, teamIcon } from "./team"
import { credentialsConfig, credentialsIcon } from "./credentials"
import { assetsConfig, assetsIcon } from "./assets"
import { thirdPartiesConfig, thirdPartiesIcon } from "./third_parties"
import { inspectionsConfig, inspectionsIcon } from "./inspections"
import { materialsConfig, materialsIcon } from "./materials"
import { permitsConfig, permitsIcon } from "./permits"
import { findingsConfig, findingsIcon } from "./findings"

/**
 * Central registry of resource configs, keyed by type. Keep in lockstep with
 * the `RESOURCE_TYPES` literal tuple in coverage-types.ts — TypeScript will
 * flag any mismatch via the Record<ResourceType, …> bound.
 */
export const RESOURCE_CONFIGS: Record<ResourceType, ResourceConfig> = {
  sites: sitesConfig,
  team: teamConfig,
  credentials: credentialsConfig,
  assets: assetsConfig,
  third_parties: thirdPartiesConfig,
  inspections: inspectionsConfig,
  materials: materialsConfig,
  permits: permitsConfig,
  findings: findingsConfig,
}

/**
 * Icon registry — Phosphor SSR components (safe in Server Components).
 * Kept separate from the config so the config stays logic-only.
 */
export const RESOURCE_ICONS: Record<ResourceType, Icon> = {
  sites: sitesIcon,
  team: teamIcon,
  credentials: credentialsIcon,
  assets: assetsIcon,
  third_parties: thirdPartiesIcon,
  inspections: inspectionsIcon,
  materials: materialsIcon,
  permits: permitsIcon,
  findings: findingsIcon,
}

export {
  sitesConfig,
  teamConfig,
  credentialsConfig,
  assetsConfig,
  thirdPartiesConfig,
  inspectionsConfig,
  materialsConfig,
  permitsConfig,
  findingsConfig,
}
