# Audit / Fix / Ship — Master Plan

**Created:** 2026-04-15 (Session 28)
**Basis:** Verified against working tree at commit `22cf44a` + 50 uncommitted files
**Supersedes:** Inventory-based priority sequencing (see `/prime` audit notes)

---

## Context Reset

The original feature inventory overstated the gap. Recent commits closed more than memory tracked:

- `22cf44a` shipped specialized templates for 27 advertised industries → **28 templates now registered** in `lib/document-templates.ts`
- `98012c8` shipped payment-first architecture (email-gated score, Stripe-created accounts) — **in-flight, 50 files uncommitted**
- `032e57f` wired 3 nightly Inngest scanners (retention / COI / reminders)
- `089f3f3` shipped COI upload pipeline + `v_construction_subs_dashboard` read path
- `b7800dc` closed 14/14 pricing-vs-product audit gaps (Session 25/26)

The dashboard sidebar at `app/dashboard/layout.tsx` already links chat, knowledge, calendar, regulations, alerts, samples, training, sites, rollup, marketplace, poster-compliance. The OSHA widgets in `lib/osha-api.ts` already bridge to the scraper DB via `createScraperClient()`. The regulatory scan Inngest function already pulls Cal/OSHA + DLSE + Federal OSHA RSS.

What remains is **verification + content seeding + nav reachability for vertical-specific pages**.

---

## Phase 0 — Pre-work (blocking)

Before new scope, resolve in-flight state.

| # | Task | Owner | Gate |
|---|------|-------|------|
| 0.1 | Review 50 uncommitted files (payment-first work from `98012c8`). Stage, review diffs, decide commit vs. revert per file. | — | Clean working tree |
| 0.2 | Export Supabase multi-site migrations (021_sites, 022+) from live DB into `supabase/migrations/`. Open item since Session 26. | — | Schema source-controlled |
| 0.3 | Decide: fix 19 preexisting test failures now, or defer to dedicated session. Blocks CI confidence on Phase 1 changes. | — | Decision recorded |

---

## Phase 1 — Verify & close silent quality gaps (1–2 days)

All code-level, no content authoring.

### 1.1 Template registry integrity audit
**Goal:** Confirm every one of 28 template IDs in `lib/document-templates.ts` resolves end-to-end through `lib/ai/document-generator.ts` → `lib/actions/documents.ts` → PDF output.

**Method:**
- Enumerate all `id:` values in `lib/document-templates.ts` (28 templates).
- Cross-check against `documents.ts` switch/lookup logic.
- Write a script `scripts/audit-templates.ts` that iterates every template ID and calls the generator with mock client data; log success/failure per ID.
- File Linear issues for any silent-failure IDs.

**Deliverable:** `scripts/audit-templates.ts` + report; 0 silent failures.

### 1.2 Dashboard reachability audit
**Goal:** Confirm every vertical-specific page is reachable by the user who should see it.

**Unlinked pages to verify:**
- `construction/subcontractors` (top-level; likely reachable via construction vertical view)
- `healthcare/baa-tracker`, `healthcare/phi-inventory`
- `manufacturing/equipment`
- `agriculture/crews`
- `transportation/fleet`
- `retail/locations`
- `hospitality/inspections`
- `real-estate/properties`
- `auto-services` (top-level)
- `wholesale/forklift-operators`, `wholesale/zones`
- Report sub-pages: `delivery-log`, `document-history`, `incident-analysis`, `regulatory-impact`

**Method:**
- Read `app/dashboard/layout.tsx` sidebar construction logic. Confirm whether vertical section expands based on `clients.vertical`.
- For report sub-pages, confirm reachable via `/dashboard/reports` hub (read `reports/page.tsx`).
- For any page unreachable in all paths, add conditional nav entry.

**Deliverable:** Every page either reachable via sidebar OR intentionally orphaned (document which).

### 1.3 Enforcement widgets on dashboard
**Goal:** Confirm `OshaNearbyEnforcement` (and sibling widgets) are actually mounted where clients see them.

**Method:**
- Grep for `<OshaNearbyEnforcement`, `getIndustryProfile`, `getBenchmarks` usage across `app/dashboard/**`.
- If mounted only on one page (or none), add to main dashboard overview at `app/dashboard/page.tsx`.
- Verify NAICS/zip parameters come from `clients` table (not hardcoded).

**Deliverable:** Enforcement data surfaced on `/dashboard` (main) + per-vertical views.

### 1.4 Compliance calendar personalization
**Goal:** Confirm `/dashboard/calendar` renders per-client dates.

**Required calendar entries per client:**
- Annual WVPP refresh date
- Quarterly review date (Professional+ tier)
- Training anniversary
- Dec 2026 permanent workplace violence standard countdown
- Certification expiries (forklift, DQ files, etc., per vertical)
- Inspection anniversaries

**Method:**
- Read `app/dashboard/calendar/page.tsx` + `lib/actions/calendar.ts`.
- Verify data source pulls from `training_records`, `compliance_reminders`, vertical tables.
- Add missing date computations.

**Deliverable:** Calendar shows ≥5 personalized dates per active client.

---

## Phase 2 — Content seeding (3–5 days)

Authoring work, not code.

### 2.1 Sample library expansion
**Current:** 3 hardcoded samples in `app/dashboard/samples/page.tsx`.
**Target:** 7 samples.

**Add:**
- Sample incident log entry (PII-stripped per SB 553)
- Sample audit-ready package Table of Contents
- Sample quarterly review report
- Sample IIPP (redacted real)

**Method:** Migrate hardcoded array to DB table or content file so samples are editable without deploys. Use existing `/api/samples/gate` for download gating.

### 2.2 Knowledge base content seed
**Current:** `osha_knowledge_base` table exists (migration `019`), article count unknown. Need verification query first.

**Platform-wide articles (7):**
1. What happens during a Cal/OSHA inspection
2. Employee rights + obligations for incident log requests
3. The 5-year record retention requirement explained
4. First 24 hours after a workplace incident
5. Reading your compliance score — what each gap means
6. Serious vs. willful vs. repeat violations
7. Annual training requirements: what counts

**Vertical articles (5–7 per vertical × 10 verticals = 50–70):**
Verticals: construction, healthcare, real-estate, agriculture, manufacturing, transportation, retail, hospitality, auto-services, wholesale.

**Method:**
- Verify current seed count via `SELECT count(*) FROM osha_knowledge_base GROUP BY applies_to_verticals`.
- Source material: existing blog content at `content/blog/*.md` (many compliance guides already written; can be adapted/chunked).
- Write seed script `scripts/seed-knowledge-articles.ts` with content, categories, vertical tags.

**Phasing:** Platform-wide first (blocks AI chat retrieval quality), then 2 verticals per week.

### 2.3 Training materials
**Current:** `lib/actions/training.ts` has `getTrainingRecords()` only.

**Required:**
- SB 553 employee summary (1-pager, shareable)
- Manager guide: "How to talk to your team about workplace violence prevention"
- Employee sign-off sheet templates (generated per client)
- Annual training reminder materials

**Method:** Content authoring + add to `/dashboard/training` as downloadable resources. May require `training_materials` table if none exists (check migrations).

---

## Phase 3 — Channel & distribution (multi-week, background)

### 3.1 Partner portal white-label enablement
Already scaffolded per Session 10 memory (`partner_portal.md`). Verify feature completeness:
- Partner-branded assessment tool
- Commission tracking
- Client roster per partner
- "The Protekon Practice" content library access

### 3.2 Multi-state jurisdiction-aware generation
Already partial: `protekon_state_plans` table exists. Verify document generator swaps "Cal/OSHA" ↔ "OSHA" based on client state. Audit template strings for hardcoded "Cal/OSHA" references.

### 3.3 Content calendar activation
258-piece 90-day plan exists on paper. Execution lives in the `cli-marketing` + `cli-content` toolchain, not this repo. Out of scope for Protekon spec; track separately.

---

## Execution order + gates

```
Phase 0 (blocking)
  └─ clean working tree → migrations exported → test-fix decision
       │
Phase 1 (parallel-safe)
  ├─ 1.1 template audit → 0 silent failures
  ├─ 1.2 nav reachability → every page linked or documented
  ├─ 1.3 enforcement widgets → mounted on /dashboard
  └─ 1.4 calendar personalization → ≥5 dates/client
       │
Phase 2 (serial per item, parallel across items)
  ├─ 2.1 samples → 7 samples live
  ├─ 2.2 KB seed (platform first, then verticals)
  └─ 2.3 training materials
       │
Phase 3 (background/scheduled)
```

Gate between phases: quality-gates pass + manual QA on preview deploy.

---

## Out of scope

- 258-piece content pipeline (lives in `cli-marketing`)
- AI chat prompt engineering (separate ticket)
- Stripe / billing changes (Session 28 in-flight, covered by Phase 0.1)
- Rebranding / copy rewrites (complete per Session 25/27)

---

## Open questions for Ian

1. Phase 0.3: fix 19 test failures now (adds ~1 day) or defer?
2. Phase 2.2 KB seeding: author fresh or adapt existing `content/blog/*.md`? (adaptation is 5× faster but content is marketing-voiced, not in-app-reference-voiced)
3. Phase 2.3 training: build a `training_materials` table or keep as static content files?
4. Phase 1.2 vertical pages: intentionally orphaned for tier/vertical gating, or oversight?
