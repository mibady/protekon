/**
 * Dashboard mocks — ported from `protekon dashboard(Remix)/components/dashboard.jsx` lines 12-77.
 *
 * These are static fixtures sized to a real Golden State Plumbing (Construction, CA)
 * profile. Each block is a TODO marker pointing to where Wave 3+ will wire live data.
 */

export type TemplateStatus =
  | "current"
  | "review_due"
  | "missing"
  | "retention_expiring"
  | "expired"
  | "expiring"

export type Template = {
  id: string
  name: string
  authority: string
  retention_years: number
  review: string
  status: TemplateStatus
  updated: string
  next_review: string
}

export type Subcontractor = {
  id: string
  name: string
  trade: string
  license: string
  license_status: "current" | "expired"
  coi_status: "current" | "expiring" | "expired"
  coi_expires: string
  w9: boolean
  last_audit: string
  risk: "low" | "medium" | "high"
}

export type RetentionAlert = {
  doc: string
  bucket: string
  due_in: string
  authority: string
}

export type RadarCitation = {
  trade: string
  count: number
  window: string
  distance: string
}

export type SeasonalWindow = {
  id: string
  label: string
  startMonth: number
  endMonth: number
  tone: "enforcement" | "sand" | "steel"
  note: string
}

// TODO(wave-3): wire to lib/v2/coverage-resources/index.ts (canonical nine aggregator)
export const CANONICAL_NINE: readonly Template[] = [
  { id: "wvpp",     name: "SB 553 WVPP",             authority: "CA Lab. Code §6401.9",    retention_years: 5, review: "Annual",     status: "current",            updated: "Mar 12, 2025", next_review: "Mar 12, 2026" },
  { id: "iipp",     name: "IIPP",                    authority: "8 CCR §3203",             retention_years: 1, review: "Annual",     status: "review_due",         updated: "Feb 02, 2024", next_review: "Overdue 42 days" },
  { id: "heat",     name: "Heat Illness Prevention", authority: "8 CCR §3395",             retention_years: 1, review: "Seasonal",   status: "current",            updated: "Apr 18, 2025", next_review: "Apr 18, 2026" },
  { id: "hazcom",   name: "HazCom / GHS",            authority: "29 CFR 1910.1200",        retention_years: 5, review: "Biennial",   status: "current",            updated: "Nov 04, 2024", next_review: "Nov 04, 2026" },
  { id: "osha300",  name: "OSHA 300 Log",            authority: "29 CFR 1904",             retention_years: 5, review: "Continuous", status: "retention_expiring", updated: "Jan 31, 2025", next_review: "2020 log — purge May 2025" },
  { id: "eap",      name: "EAP",                     authority: "29 CFR 1910.38",          retention_years: 1, review: "Annual",     status: "current",            updated: "Jan 08, 2025", next_review: "Jan 08, 2026" },
  { id: "incident", name: "Incident Investigation",  authority: "8 CCR §14300.35",         retention_years: 5, review: "Per event",  status: "current",            updated: "Mar 24, 2025", next_review: "—" },
  { id: "training", name: "Training Records",        authority: "8 CCR §3203(a)(7)",       retention_years: 1, review: "Ongoing",    status: "current",            updated: "Apr 02, 2025", next_review: "Rolling" },
  { id: "hearing",  name: "Hearing Conservation",    authority: "29 CFR 1910.95",          retention_years: 2, review: "Annual",     status: "missing",            updated: "—",            next_review: "Generate required" },
] as const

// TODO(wave-3): wire to lib/v2/coverage-resources/<industry>.ts (vertical-specific hazards)
export const INDUSTRY_HAZARDS: readonly Template[] = [
  { id: "fall",     name: "Fall Protection",           authority: "29 CFR 1926.501 · 8 CCR §1670",    retention_years: 5,  review: "Annual",   status: "current", updated: "Feb 14, 2025", next_review: "Feb 14, 2026" },
  { id: "silica",   name: "Silica Exposure Plan",      authority: "8 CCR §1532.3",                    retention_years: 30, review: "Annual",   status: "current", updated: "Feb 14, 2025", next_review: "Feb 14, 2026" },
  { id: "confined", name: "Confined Space Entry",      authority: "29 CFR 1926.1200 · 8 CCR §5157",   retention_years: 5,  review: "Annual",   status: "current", updated: "Mar 01, 2025", next_review: "Mar 01, 2026" },
  { id: "wildfire", name: "Wildfire Smoke Protection", authority: "8 CCR §5141.1",                    retention_years: 1,  review: "Seasonal", status: "current", updated: "May 30, 2025", next_review: "May 30, 2026" },
] as const

// TODO(wave-3): wire to lib/v2/coverage-resources (cross-listed specialized templates)
export const SPECIALIZED: readonly Template[] = [
  { id: "electrical", name: "Electrical Safety",              authority: "29 CFR 1910.331 · 8 CCR §2320", retention_years: 5,  review: "Annual", status: "current",    updated: "Feb 28, 2025", next_review: "Feb 28, 2026" },
  { id: "resp",       name: "Respiratory Protection",         authority: "29 CFR 1910.134 · 8 CCR §5144", retention_years: 30, review: "Annual", status: "current",    updated: "Feb 28, 2025", next_review: "Feb 28, 2026" },
  { id: "multiemp",   name: "Multi-employer Worksite Policy", authority: "8 CCR §1509",                   retention_years: 3,  review: "Annual", status: "review_due", updated: "Jun 12, 2024", next_review: "Overdue 15 days" },
] as const

// TODO(wave-3): wire to v_construction_subs_dashboard / lib/actions/subcontractors.ts
export const SUBCONTRACTORS: readonly Subcontractor[] = [
  { id: "s1", name: "Alvarez Excavation",   trade: "Excavation", license: "C-12 #998241", license_status: "current", coi_status: "current",  coi_expires: "Aug 14, 2025", w9: true,  last_audit: "Mar 08, 2025", risk: "low" },
  { id: "s2", name: "Northbay Electric",    trade: "Electrical", license: "C-10 #771203", license_status: "current", coi_status: "expiring", coi_expires: "May 02, 2025", w9: true,  last_audit: "Jan 22, 2025", risk: "medium" },
  { id: "s3", name: "Sierra Drywall Co.",   trade: "Drywall",    license: "C-9 #554091",  license_status: "expired", coi_status: "current",  coi_expires: "Sep 30, 2025", w9: true,  last_audit: "Feb 12, 2025", risk: "high" },
  { id: "s4", name: "Pacific Framing",      trade: "Framing",    license: "C-5 #442871",  license_status: "current", coi_status: "current",  coi_expires: "Nov 18, 2025", w9: true,  last_audit: "Mar 30, 2025", risk: "low" },
  { id: "s5", name: "Delta Mechanical",     trade: "HVAC",       license: "C-20 #661250", license_status: "current", coi_status: "expired",  coi_expires: "Mar 15, 2025", w9: false, last_audit: "Feb 01, 2025", risk: "high" },
  { id: "s6", name: "Crestline Roofing",    trade: "Roofing",    license: "C-39 #887322", license_status: "current", coi_status: "current",  coi_expires: "Oct 22, 2025", w9: true,  last_audit: "Mar 18, 2025", risk: "low" },
  { id: "s7", name: "Bayview Tile & Stone", trade: "Tile",       license: "C-54 #220118", license_status: "current", coi_status: "expiring", coi_expires: "May 18, 2025", w9: true,  last_audit: "—",            risk: "medium" },
] as const

// TODO(wave-3): wire to v_retention_alerts
export const RETENTION_ALERTS: readonly RetentionAlert[] = [
  { doc: "I-9 Forms (2022 cohort)",    bucket: "3-year", due_in: "18 days", authority: "USCIS" },
  { doc: "OSHA 300 Log — 2020",        bucket: "5-year", due_in: "42 days", authority: "29 CFR 1904" },
  { doc: "Training Records (Q2 2024)", bucket: "1-year", due_in: "61 days", authority: "8 CCR §3203" },
  { doc: "Incident Report #2022-014",  bucket: "5-year", due_in: "88 days", authority: "8 CCR §14300.35" },
] as const

// TODO(wave-3): wire to protekon_get_enforcement_actions scraper feed
export const RADAR_CITATIONS: readonly RadarCitation[] = [
  { trade: "Silica exposure", count: 3, window: "30 days", distance: "Alameda County" },
  { trade: "Fall protection", count: 7, window: "30 days", distance: "Bay Area" },
  { trade: "Heat illness",    count: 2, window: "30 days", distance: "Alameda County" },
  { trade: "WVPP (SB 553)",   count: 5, window: "90 days", distance: "California-wide" },
] as const

// TODO(wave-3): wire to regulatory calendar (hardcoded seasonal windows are stable)
export const SEASONAL_WINDOWS: readonly SeasonalWindow[] = [
  { id: "osha300a", label: "OSHA 300A Posting",      startMonth: 1, endMonth: 3,  tone: "enforcement", note: "Feb 1 – Apr 30" },
  { id: "heat",     label: "Heat Illness Window",    startMonth: 4, endMonth: 8,  tone: "sand",        note: "May – Sept" },
  { id: "wildfire", label: "Wildfire Smoke Window",  startMonth: 5, endMonth: 10, tone: "sand",        note: "Jun – Nov" },
  { id: "audit",    label: "Annual IIPP Review",     startMonth: 0, endMonth: 1,  tone: "steel",       note: "Jan – Feb" },
] as const
