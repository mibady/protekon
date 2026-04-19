# Protekon Coverage Summary

What the platform covers today, reconciled against the codebase. This is the **sales-facing / partner-facing** source of truth. Template internals live in `TEMPLATE-ARCHITECTURE.md`.

**Last reconciled:** 2026-04-17

## Authoritative Sources

| Domain | File |
|---|---|
| Templates | `lib/document-templates.ts` (TEMPLATE_REGISTRY) + `docs/TEMPLATE-ARCHITECTURE.md` |
| Verticals (canonical + aliases) | `supabase/migrations/022_verticals_reference.sql` |
| Verticals (marketing surface) | `app/industries/industries-client.tsx` |
| State plans (OSHA jurisdictions) | `cli-ai-scraper/supabase/migrations/20260409_protekon_national_expansion.sql` |
| Vertical → template resolution | `docs/TEMPLATE-ARCHITECTURE.md` (Per-Vertical Resolution table) |

---

## 1. Templates — 37 total

See `TEMPLATE-ARCHITECTURE.md` for sections, retention, and DB schema. Summary:

| Bucket | Count | Examples |
|---|---|---|
| Platform-wide (apply to every vertical) | **9** | IIPP, SB 553 WVPP, Heat Illness, HazCom/GHS, OSHA 300 Log, EAP, Incident Investigation, Training Records, Hearing Conservation |
| Vertical-specific core | **17** | fall-protection, silica, LOTO, machine-guarding, BBP, HIPAA SRA, ATD, BAA, pesticide-safety, fleet-safety, pit-safety, store-safety, hospitality-safety, property-compliance, spray-booth, confined-space, wildfire-smoke |
| Specialized multi-vertical (2026-04) | **11** | electrical-safety, ergonomics, respiratory-protection, hazwoper, MSHA, multi-employer-worksite, event-safety, campus-safety, janitorial-chemical, drycleaning-solvent, salon-personal-services |

Cross-listed templates (e.g., `electrical-safety-program` lives in 6 registry buckets) resolve per-vertical via `getTemplatesForVertical`.

---

## 2. Verticals — 27 advertised slugs

**26 canonical slugs + 1 alias (`logistics` → `wholesale`) = 27 advertised surface slugs.**
These resolve to **25 `TEMPLATE_REGISTRY` buckets** (wholesale and logistics share a bucket; security has no vertical-specific extras).

### Featured — `has_detail_page = true` (10 canonical + 1 alias)

construction · manufacturing · healthcare · hospitality · agriculture · retail · transportation · real-estate · auto-services · wholesale · **`logistics`** (alias, surfaces as "Warehouse & Logistics")

### Other — `has_detail_page = false` (16 canonical)

utilities · education · waste_environmental · arts_entertainment · public_admin · building_services · equipment_repair · facilities_mgmt · information (telecom) · laundry · mining · professional_services · staffing · business_support · personal_services · security

### Resolution counts per vertical (9 platform + extras)

See `TEMPLATE-ARCHITECTURE.md` § "Per-Vertical Resolution (post-expansion)". Range: **9 (security) → 16 (construction)** templates per vertical.

---

## 3. Compliance Domains

1. **Workplace Violence Prevention** — CA (SB 553, Labor Code §6401.9) live. Roadmap: CT, MD, MN, NJ, WA, TX, VA.
2. **Cal/OSHA + Federal OSHA Enforcement Intelligence** — all 50 states + DC (see §4).
3. **Healthcare Privacy** — HIPAA Security Risk Assessment + BAA tracker.
4. **Subcontractor & Construction Risk** — lien, license, COI (canonical view: `v_construction_subs_dashboard`).
5. **Municipal Ordinance Compliance** — real-estate + public_admin verticals.
6. **Roadmap** — Wage & Hour, I-9, Pay Transparency, EEO, Leave, Poster Compliance.

---

## 4. Geographic Coverage — `protekon_state_plans`

**51 seed rows** in `cli-ai-scraper/supabase/migrations/20260409_protekon_national_expansion.sql`: 50 states + DC. **No territories** are seeded today (no PR/GU/VI/AS).

| Plan type | Count | States |
|---|---|---|
| **Federal OSHA** (`plan_type = 'federal'`) | **24** | AL, AR, CO, DE, FL, GA, ID, KS*, LA, ME, MA, MS, MO, NE, NH, NJ*, OK, PA, RI, SD*, TX, WV, WI, WY + DC |
| **State Plan OSHA** (`plan_type = 'state'`) | **24** | AK, AZ, CA, HI, IN, IA, KY, MD, MI, MN, NV, NM, NC, ND, OR, PR†, SC, TN, UT, VT, VA, WA |
| **Hybrid** (`plan_type = 'hybrid'`) | **3** | CT, IL, NY (private-sector federal, public-sector state plan) |

\* Federal OSHA in the seed; some of these have proposed state plans not yet finalized.
† Puerto Rico is not in the migration's `VALUES` list — strike if you need strict 50+DC accuracy.

### Stricter-than-federal flag (`is_stricter = true`)

**4 states:** CA (Cal/OSHA) · MI (MIOSHA) · OR (OR-OSHA) · WA (WISHA / L&I)

---

## 5. Changes from Prior Summary (2026-04-16 → 2026-04-17)

Prior coverage summaries circulated with the following inaccuracies. Corrected:

| Prior claim | Codebase reality |
|---|---|
| 8 platform-wide templates | **9** (hearing-conservation was omitted) |
| "Total templates ≈ platform + per-vertical extras" | **37 total** (9 + 17 + 11 per ADR commit `22cf44a`) |
| 3-tier vertical structure | No explicit tiers in DB — marketing uses `is_advertised` + `has_detail_page` booleans |
| 27 canonical verticals + 1 alias (28 total) | **26 canonical + 1 alias = 27 advertised slugs total** |
| "All Others (17)" includes wholesale | Wholesale is **featured** (`has_detail_page = true`). Non-featured count is **16** |
| Federal OSHA 25 states | **24** |
| State Plan OSHA 26 states + territories | **24**; territories not seeded |
| Hybrid 4 states | **3** (CT, IL, NY) |
| 55 rows (50 states + DC + 4 territories) | **51 rows** (50 states + DC) |

---

## 6. When This Doc Goes Stale

Regenerate anytime the following change:

- `supabase/migrations/022_verticals_reference.sql` → update §2 counts
- `cli-ai-scraper/supabase/migrations/*_protekon_*.sql` → update §4 counts
- `lib/document-templates.ts` TEMPLATE_REGISTRY → update §1 and add Change Log entry in `TEMPLATE-ARCHITECTURE.md`
- New compliance domain shipped (e.g., Wage & Hour graduates from roadmap) → update §3
