# Document Template Architecture — Decision Record

## Status: IMPLEMENTED (2026-04-15) — EXPANDED (2026-04-15 commit 22cf44a)

## Decision: Hybrid — Sections in Code, Metadata in DB

### Source of Truth Split

| Layer | Owns | Location |
|---|---|---|
| **TS Registry** | Section definitions, headings, legal citations, target word counts, prompt instructions, required references, AI generator structure | `lib/document-templates.ts` |
| **DB Meta Table** | Queryable metadata: display_name, retention_years, review_frequency, applicable_verticals, legal_authority, is_active | `document_template_meta` (Supabase, project `yfkledwhwsembikpjynu`) |

### Rules

1. **Never put section definitions or prompt content in the database.** The TS registry is the AI generator's instruction set. It's version-controlled, type-safe, and ships with the app.

2. **Never query the TS registry for compliance calendar, retention alerts, gap analysis, or partner reporting.** Use `document_template_meta` — that's what it exists for.

3. **Sync direction is one-way: code → DB.** When templates change in `lib/document-templates.ts`, write a Supabase migration to update `document_template_meta`. Templates change rarely (legal standards don't change monthly).

4. **`documents.template_key` is plain text, not a FK.** It links a generated document back to which template produced it. No foreign key constraint to any table. The join to `document_template_meta` is optional (LEFT JOIN) — supplementary docs (gap-analysis, audit-package, salary-range, eeo-policy) have `template_key = NULL` and that's correct.

5. **Cross-vertical templates are multi-listed.** In the TS registry, templates that apply to multiple verticals appear in each vertical's bucket (same object reference). In the DB, `applicable_verticals` is a `text[]` array containing all verticals. Example: `bbp-exposure-control` → `{healthcare, hospitality}`.

### Template Counts (37 total — expanded 2026-04 to cover all 27 advertised industry slugs)

```
Platform-wide (9): wvpp, iipp, eap, hazcom, heat-illness-prevention,
                   osha-300-log, incident-investigation, training-records,
                   hearing-conservation

Vertical-specific core (17):
  Construction (4):   fall-protection-plan, silica-exposure-control,
                      confined-space-program*, wildfire-smoke-protection*
  Healthcare (4):     bbp-exposure-control*, hipaa-sra, atd-plan, baa-tracker
  Manufacturing (3):  loto-program*, machine-guarding, confined-space-program*,
                      (pit-safety-program* cross-listed from wholesale)
  Agriculture (2):    wildfire-smoke-protection*, pesticide-safety
  Transportation (1): fleet-safety-program
  Wholesale (1):      pit-safety-program*
  Retail (1):         store-safety-program, (pit-safety-program* cross-listed)
  Hospitality (1):    hospitality-safety-program
  Real Estate (1):    property-compliance-program
  Auto Services (1):  spray-booth-compliance

Specialized multi-vertical (11 — added 2026-04):
  electrical-safety-program*        → utilities, equipment_repair,
                                      building_services, information,
                                      construction, manufacturing
  ergonomics-program*               → information, professional_services,
                                      public_admin, business_support,
                                      healthcare
  respiratory-protection-program*   → waste_environmental, laundry,
                                      auto-services, agriculture, construction
  hazwoper-program                  → waste_environmental
  msha-mining-safety-program        → mining
  multi-employer-worksite-policy*   → staffing, facilities_mgmt,
                                      construction, real-estate
  event-safety-crowd-management*    → arts_entertainment, hospitality
  campus-safety-plan                → education
  janitorial-chemical-safety*       → building_services, personal_services
  drycleaning-solvent-safety        → laundry
  salon-personal-services-safety    → personal_services

* = cross-listed across multiple verticals (same object reference, many buckets)
```

### Per-Vertical Resolution (post-expansion)

```
construction:          9 + 7 = 16    manufacturing:         9 + 5 = 14
healthcare:            9 + 5 = 14    hospitality:           9 + 3 = 12
laundry:               9 + 2 = 11    building_services:     9 + 3 = 12
agriculture:           9 + 3 = 12    equipment_repair:      9 + 2 = 11
retail:                9 + 2 = 11    personal_services:     9 + 2 = 11
real-estate:           9 + 2 = 11    information:           9 + 2 = 11
waste_environmental:   9 + 2 = 11    auto-services:         9 + 2 = 11
utilities:             9 + 1 = 10    mining:                9 + 1 = 10
education:             9 + 1 = 10    arts_entertainment:    9 + 1 = 10
public_admin:          9 + 1 = 10    facilities_mgmt:       9 + 1 = 10
staffing:              9 + 1 = 10    professional_services: 9 + 1 = 10
business_support:      9 + 1 = 10    transportation:        9 + 1 = 10
wholesale:             9 + 1 = 10    logistics (alias):     9 + 1 = 10
security:              9 + 0 =  9  (SB 553 WVPP in platform is the primary doc)
```

### Vertical Aliases

Marketing slugs that resolve to canonical registry keys. Handled in-code
by `VERTICAL_ALIASES` in `lib/document-templates.ts`; applied by
`getDocumentTemplate`, `getTemplatesForVertical`, and `getStarterDocuments`.

| Marketing slug | Canonical key |
|---|---|
| `logistics` | `wholesale` |

Aliases should also be represented in `document_template_meta`'s `applicable_verticals` array so DB-side gap analysis works for both the marketing slug and the canonical key.

### Verticals Surface (27 advertised slugs = 26 canonical + 1 alias)

Authoritative source: `supabase/migrations/022_verticals_reference.sql`. Marketing list: `app/industries/industries-client.tsx`. The 27 slugs resolve to **25 `TEMPLATE_REGISTRY` buckets** (security has no vertical-specific extras; `logistics` aliases to `wholesale`).

**Featured — `has_detail_page = true` (10 canonical + 1 alias = 11 slugs):**
`construction`, `manufacturing`, `healthcare`, `hospitality`, `agriculture`, `retail`, `transportation`, `real-estate`, `auto-services`, `wholesale`, + `logistics` (alias → wholesale, surfaces as "Warehouse & Logistics").

**Other — `has_detail_page = false` (16 canonical):**
`utilities`, `education`, `waste_environmental`, `arts_entertainment`, `public_admin`, `building_services`, `equipment_repair`, `facilities_mgmt`, `information`, `laundry`, `mining`, `professional_services`, `staffing`, `business_support`, `personal_services`, `security`.

Don't double-count `wholesale` and `logistics`: they share a `TEMPLATE_REGISTRY` bucket and the same template set. On the marketing site only one label appears ("Warehouse & Logistics" at slug `logistics`) — `wholesale` is the internal canonical key used by documents and gap analysis.

### DB Schema

```sql
-- document_template_meta (migration: create_document_template_meta)
CREATE TABLE document_template_meta (
  template_key         text PRIMARY KEY,       -- matches TS registry ID
  display_name         text NOT NULL,
  category             text NOT NULL,          -- platform_wide | vertical_specific
  applicable_verticals text[] NOT NULL DEFAULT '{}',
  legal_authority      text NOT NULL,
  retention_years      integer NOT NULL,
  review_frequency     text NOT NULL,          -- annual, semi_annual, quarterly, etc.
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- GIN index on applicable_verticals for vertical-based queries
-- v_retention_alerts view joins documents LEFT JOIN document_template_meta
```

### Key Queries This Enables

```sql
-- "Which templates should this healthcare client have?"
SELECT * FROM document_template_meta
WHERE category = 'platform_wide' OR 'healthcare' = ANY(applicable_verticals);

-- "Which required documents is this client missing?"
SELECT dtm.template_key, dtm.display_name
FROM document_template_meta dtm
LEFT JOIN documents d ON d.template_key = dtm.template_key
  AND d.client_id = '<client_id>'
WHERE (dtm.category = 'platform_wide' OR '<vertical>' = ANY(dtm.applicable_verticals))
  AND d.id IS NULL;

-- "Which documents are approaching retention expiry?"
SELECT * FROM v_retention_alerts WHERE alert_type IN ('retention_expiring', 'retention_expired');

-- "Partner reporting: how many clients have generated their WVPP?"
SELECT count(*) FILTER (WHERE d.template_key = 'wvpp') AS has_wvpp,
       count(*) AS total_clients
FROM partner_clients pc
JOIN clients c ON c.id = pc.client_id
LEFT JOIN documents d ON d.client_id = c.id AND d.template_key = 'wvpp';
```

### What Was Removed

- `document_templates` table (orphaned — never had a migration, code never read from it)
- `template_sections` table (orphaned — same reason)
- `documents_template_key_fkey` FK constraint (documents.template_key is now plain text)

### Files That Matter

- `lib/document-templates.ts` — TS registry (TEMPLATE_REGISTRY, section definitions, all exports)
- `lib/actions/documents.ts` — `getAvailableDocTypesForUser()` calls `getTemplatesForVertical()`
- `app/dashboard/documents/request/page.tsx` — document request UI
- `supabase/migrations/*create_document_template_meta*` — the migration

### Demo Data (Coastal Health Group)

17 documents seeded. 12 have `template_key` matching the registry. 5 are supplementary (gap-analysis, incident-response-protocol, audit-package, salary-range, eeo-policy) with `template_key = NULL`.

### Change Log

- **2026-04-15 (baseline)** — ADR ratified. 26 templates, 10 verticals, hybrid model adopted.
- **2026-04-15 (commit `22cf44a`)** — Expanded to 37 templates / 25 vertical buckets to close the 17-industry demo gap. 11 specialized templates authored: electrical-safety, ergonomics, respiratory-protection, hazwoper, msha-mining-safety, multi-employer-worksite, event-safety, campus-safety, janitorial-chemical, drycleaning-solvent, salon-personal-services. Cross-vertical resolution fixed (bbp, confined-space, pit-safety, wildfire-smoke now multi-listed). `VERTICAL_ALIASES { logistics → wholesale }` added. Tests: `__tests__/document-templates.test.ts` — 8 passing.
- **2026-04-17** — Reconciled coverage summary against authoritative sources. Added "Verticals Surface" section clarifying **27 advertised slugs = 26 canonical + 1 alias** (logistics → wholesale), split into 10 featured + 16 other + 1 alias. Corrected shorthand "27 advertised industries" → "27 advertised industry slugs" to avoid implying 27 distinct buckets (actual: 25 `TEMPLATE_REGISTRY` buckets). No template-count changes.
- **Pending** — Follow-up migration to upsert the 11 new templates into `document_template_meta` with matching `applicable_verticals` arrays, preserving the one-way code → DB sync rule.
