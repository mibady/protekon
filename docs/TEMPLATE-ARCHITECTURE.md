# Document Template Architecture — Decision Record

## Status: IMPLEMENTED (2026-04-15)

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

### Template Counts (26 total)

```
Platform-wide (9): wvpp, iipp, eap, hazcom, heat-illness-prevention,
                   osha-300-log, incident-investigation, training-records,
                   hearing-conservation

Construction (4):  fall-protection-plan, silica-exposure-control,
                   confined-space-program*, wildfire-smoke-protection*

Healthcare (4):    bbp-exposure-control*, hipaa-sra, atd-plan, baa-tracker

Manufacturing (4): loto-program, machine-guarding, confined-space-program*,
                   pit-safety-program*

Agriculture (2):   wildfire-smoke-protection*, pesticide-safety

Transportation (1): fleet-safety-program
Wholesale (1):      pit-safety-program*
Retail (2):         store-safety-program, pit-safety-program*
Hospitality (2):    hospitality-safety-program, bbp-exposure-control*
Real Estate (1):    property-compliance-program
Auto Services (1):  spray-booth-compliance

* = cross-listed across multiple verticals
```

### Per-Vertical Resolution

```
construction:  9 + 4 = 13    healthcare:    9 + 4 = 13
manufacturing: 9 + 4 = 13    agriculture:   9 + 2 = 11
hospitality:   9 + 2 = 11    retail:        9 + 2 = 11
wholesale:     9 + 1 = 10    transportation:9 + 1 = 10
real-estate:   9 + 1 = 10    auto-services: 9 + 1 = 10
```

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
