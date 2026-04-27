/**
 * Dashboard terminology adapter.
 *
 * Reuses the onboarding vertical-config registry (`lib/onboarding/verticals/`)
 * for `worker` / `thirdParty` and layers a small in-file dictionary for the
 * dashboard-only `location` term and group-label overrides. This keeps a
 * single source of truth for vertical terminology without bleeding dashboard
 * concerns into the onboarding contract.
 *
 * Used by Sidebar (group label, isConstructionFamily gating) and
 * DashboardSurface (TabToggle labels, risk-view titles).
 */

import {
  getOnboardingConfig,
  type VerticalSlug,
} from "@/lib/onboarding/verticals"

export type DashboardTerminology = {
  worker: string
  workerPlural: string
  thirdParty: string
  thirdPartyPlural: string
  /** Sidebar group label — defaults to thirdPartyPlural unless overridden. */
  thirdPartyGroupLabel: string
  location: string
  locationPlural: string
  /** True for construction | heavy-civil | real-estate. Gates the third-party hub link. */
  isConstructionFamily: boolean
}

const CONSTRUCTION_FAMILY: ReadonlySet<string> = new Set([
  "construction",
  "heavy-civil",
  "real-estate",
])

// Dashboard-specific third-party label override. The onboarding config marks
// healthcare's thirdParty as null because healthcare doesn't run a Step-5
// onboarding flow, but the dashboard still needs a localized noun ("Business
// Associate") for headings and tabs. Manufacturing/retail/etc. fall through
// to whatever the onboarding config carries.
const THIRD_PARTY_OVERRIDE: Readonly<Record<string, string>> = {
  healthcare: "Business Associate",
  manufacturing: "Supplier",
  retail: "Vendor",
  hospitality: "Vendor",
  wholesale: "Supplier",
  transportation: "Carrier",
  "auto-services": "Vendor",
  utilities: "Contractor",
  agriculture: "Supplier",
  mining: "Contractor",
  waste_environmental: "Hauler",
  education: "Vendor",
  arts_entertainment: "Vendor",
  public_admin: "Vendor",
  building_services: "Vendor",
  equipment_repair: "Vendor",
  facilities_mgmt: "Vendor",
  information: "Vendor",
  laundry: "Vendor",
  professional_services: "Vendor",
  staffing: "Client",
  business_support: "Vendor",
  personal_services: "Vendor",
  security: "Vendor",
}

// Sidebar group label override — punchier than `${thirdPartyPlural}` for some
// verticals (construction's "My Subs" is the canonical example).
const GROUP_LABEL_OVERRIDE: Readonly<Record<string, string>> = {
  construction: "My Subs",
  "heavy-civil": "My Subs",
  "real-estate": "Vendors",
}

const LOCATION_TERMS: Readonly<Record<string, { singular: string; plural: string }>> = {
  construction: { singular: "Site", plural: "Sites" },
  "heavy-civil": { singular: "Site", plural: "Sites" },
  "real-estate": { singular: "Property", plural: "Properties" },
  healthcare: { singular: "Facility", plural: "Facilities" },
  manufacturing: { singular: "Plant", plural: "Plants" },
  retail: { singular: "Store", plural: "Stores" },
  hospitality: { singular: "Property", plural: "Properties" },
  wholesale: { singular: "Warehouse", plural: "Warehouses" },
  transportation: { singular: "Terminal", plural: "Terminals" },
  "auto-services": { singular: "Shop", plural: "Shops" },
  utilities: { singular: "Facility", plural: "Facilities" },
  agriculture: { singular: "Operation", plural: "Operations" },
  mining: { singular: "Site", plural: "Sites" },
  waste_environmental: { singular: "Site", plural: "Sites" },
  education: { singular: "Campus", plural: "Campuses" },
  arts_entertainment: { singular: "Venue", plural: "Venues" },
  public_admin: { singular: "Office", plural: "Offices" },
  building_services: { singular: "Site", plural: "Sites" },
  equipment_repair: { singular: "Shop", plural: "Shops" },
  facilities_mgmt: { singular: "Facility", plural: "Facilities" },
  information: { singular: "Office", plural: "Offices" },
  laundry: { singular: "Plant", plural: "Plants" },
  professional_services: { singular: "Office", plural: "Offices" },
  staffing: { singular: "Office", plural: "Offices" },
  business_support: { singular: "Office", plural: "Offices" },
  personal_services: { singular: "Location", plural: "Locations" },
  security: { singular: "Post", plural: "Posts" },
}

const FALLBACK: DashboardTerminology = {
  worker: "Worker",
  workerPlural: "Workers",
  thirdParty: "Third Party",
  thirdPartyPlural: "Third Parties",
  thirdPartyGroupLabel: "Third Parties",
  location: "Location",
  locationPlural: "Locations",
  isConstructionFamily: false,
}

function pluralize(term: string): string {
  if (!term) return term
  if (/(s|x|z|ch|sh)$/i.test(term)) return `${term}es`
  if (/[^aeiou]y$/i.test(term)) return `${term.slice(0, -1)}ies`
  return `${term}s`
}

/**
 * Resolve dashboard terminology for a vertical slug.
 *
 * Returns safe defaults when the slug is null, undefined, or unknown — never
 * returns undefined values, so the UI can read fields directly without
 * optional chaining.
 */
export function getDashboardTerminology(
  slug: string | null | undefined,
): DashboardTerminology {
  if (!slug) return FALLBACK

  const config = getOnboardingConfig(slug as VerticalSlug)
  const isConstructionFamily = CONSTRUCTION_FAMILY.has(slug)

  const worker = config.peopleTerminology.worker || FALLBACK.worker
  const workerPlural = pluralize(worker)

  const thirdParty =
    THIRD_PARTY_OVERRIDE[slug] ??
    config.peopleTerminology.thirdParty ??
    FALLBACK.thirdParty
  const thirdPartyPlural = pluralize(thirdParty)

  const thirdPartyGroupLabel =
    GROUP_LABEL_OVERRIDE[slug] ?? thirdPartyPlural

  const loc = LOCATION_TERMS[slug] ?? {
    singular: FALLBACK.location,
    plural: FALLBACK.locationPlural,
  }

  return {
    worker,
    workerPlural,
    thirdParty,
    thirdPartyPlural,
    thirdPartyGroupLabel,
    location: loc.singular,
    locationPlural: loc.plural,
    isConstructionFamily,
  }
}
