# production-polish Plan

## Objective
Ship Protekon to production by wiring all remaining decorative UI elements, configuring Stripe products/env vars, adding export functionality, and passing full quality gates.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Frontend Builder A | builder-ui-exports | .claude/agents/team/builder.md | Export buttons + CSV/PDF download endpoints |
| Frontend Builder B | builder-ui-wiring | .claude/agents/team/builder.md | Decorative buttons, incident edit, 2FA placeholder |
| Backend Builder | builder-api | .claude/agents/team/builder.md | Stripe env validation, checkout hardening |
| Validator | validator | .claude/agents/team/validator.md | Quality gates (tsc, lint, tests, build) |
| Fixer | fixer | .claude/agents/team/fixer.md | Fix any gate failures |
| Auditor | auditor | .claude/agents/team/auditor.md | UI functional verification |

## Contract

### Export API Shape
```typescript
// GET /api/export/incidents?format=csv|pdf
// GET /api/export/report?type=compliance-score|regulatory-impact|annual-summary|document-history|incident-analysis|delivery-log&format=pdf

// Response: stream with Content-Disposition header
// Auth: requires valid session (middleware-protected under /api/export/)
```

### Decorative Button Handlers
```typescript
// Incidents page — export + edit
type IncidentExportFormat = 'csv' | 'pdf';
type IncidentEditAction = (id: string) => void; // opens edit modal or inline form

// Alerts page — bulk actions
type MarkAllReadAction = () => Promise<void>; // server action: marks all alerts read
type LoadMoreAction = () => void; // pagination cursor

// Regulations page — view source
type ViewSourceAction = (url: string) => void; // window.open to regulatory source URL

// Settings page — 2FA
// Show toast: "Two-factor authentication coming soon"
```

### Server Actions (new)
```typescript
// lib/actions/alerts.ts
export async function markAllAlertsRead(): Promise<{ success: boolean }>;

// lib/actions/incidents.ts (extend existing)
export async function updateIncident(id: string, data: Partial<Incident>): Promise<{ success: boolean }>;
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-ui-exports | app/api/export/**, app/dashboard/reports/compliance-score/page.tsx, app/dashboard/reports/regulatory-impact/page.tsx, app/dashboard/reports/annual-summary/page.tsx, app/dashboard/reports/document-history/page.tsx, app/dashboard/reports/incident-analysis/page.tsx, app/dashboard/reports/delivery-log/page.tsx, app/dashboard/incidents/page.tsx (export buttons only) | alerts, settings, regulations |
| builder-ui-wiring | app/dashboard/alerts/page.tsx, app/dashboard/regulations/page.tsx, app/dashboard/settings/page.tsx, app/dashboard/incidents/page.tsx (edit buttons only), lib/actions/alerts.ts | api/export/**, reports sub-pages |
| builder-api | lib/stripe.ts, app/api/stripe/checkout/route.ts | dashboard pages, components |
| validator | (reads all, writes none) | — |
| fixer | any file flagged by validator | — |
| auditor | (reads all, writes none) | — |

## Tasks

### Task 1: Wire Export Endpoints + Report Buttons
- **Owner:** builder-ui-exports
- **Input:** Contract above, existing report pages
- **Output:** `app/api/export/incidents/route.ts`, `app/api/export/report/route.ts`, updated report pages with working export buttons
- **Dependencies:** none
- **Instructions:**
  Create two API routes under `app/api/export/` that query Supabase and stream CSV or PDF responses. Use existing `createSupabaseServer()` pattern from other API routes. For PDF, use the existing pdf-lib pattern from `inngest/functions/document-generation.ts`. Wire all 6 report page export buttons to call these endpoints via `window.open()` or fetch+download. Wire the incidents page export button (line ~48) and modal export button (line ~324) to the incidents export endpoint.

### Task 2: Wire Decorative Buttons + Incident Edit
- **Owner:** builder-ui-wiring
- **Input:** Contract above, existing dashboard pages
- **Output:** Updated alerts, regulations, settings, incidents pages with functional buttons; new `lib/actions/alerts.ts`
- **Dependencies:** none
- **Instructions:**
  1. **Alerts page:** Add `markAllAlertsRead()` server action in `lib/actions/alerts.ts` (update all client alerts where `read = false`). Wire "Mark All as Read" button. Wire "Load Earlier Alerts" with simple pagination (load next 20).
  2. **Regulations page:** Wire "View Source" to `window.open(regulation.source_url, '_blank')` — if no URL, show toast "Source not available".
  3. **Settings page:** Wire 2FA button to show toast "Two-factor authentication coming soon" (real 2FA is a future feature).
  4. **Incidents page:** Add `updateIncident()` to existing `lib/actions/incidents.ts`. Wire edit buttons to open a pre-filled form (reuse the new-incident form pattern). Support saving edits.

### Task 3: Harden Stripe Checkout
- **Owner:** builder-api
- **Input:** Current `lib/stripe.ts` and checkout route
- **Output:** Updated checkout route with empty-price validation
- **Dependencies:** none
- **Instructions:**
  Add explicit check in `app/api/stripe/checkout/route.ts`: if `priceId` resolves to empty string (env var not set), return 400 with message "Stripe not configured for this plan. Contact support." This prevents cryptic Stripe API errors in production before products are created. Do NOT create Stripe products — that's a manual dashboard task. Also verify the portal route at `app/api/stripe/portal/route.ts` exists and works (it was flagged as potentially missing in audit).

### Task 4: Validate
- **Owner:** validator
- **Input:** All builder outputs (Tasks 1-3)
- **Output:** Quality gate results (tsc, lint, tests, build)
- **Dependencies:** Task 1, Task 2, Task 3
- **Instructions:**
  Run full quality gates: `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build`. Report all failures with file paths and line numbers for Fixer. Zero tolerance — all four gates must pass.

### Task 5: Fix (if needed)
- **Owner:** fixer
- **Input:** Validator failure report from Task 4
- **Output:** Fixed files, re-validated
- **Dependencies:** Task 4
- **Instructions:**
  Fix ONE error at a time from Validator report. After each fix, re-run the failing gate to confirm. Do not batch fixes. If all gates pass from Task 4, this task is auto-completed.

### Task 6: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional rate report for all wired buttons
- **Dependencies:** Task 4 (or Task 5 if triggered)
- **Instructions:**
  Verify every button wired in Tasks 1-2 is functional. Check: export buttons trigger downloads, Mark All as Read updates state, View Source opens URL, 2FA shows toast, incident edit saves data. Read the source code for each page and confirm handlers are wired. Target: >= 95% functional rate (14 buttons total, max 0 critical failures).

## Execution Order
1. Task 1 + Task 2 + Task 3 (parallel — no dependencies between builders)
2. Task 4: Validate (depends on Tasks 1, 2, 3)
3. Task 5: Fix (depends on Task 4, conditional)
4. Task 6: Audit (depends on Task 4/5)

## References Consulted
- Session 7 notes (8 TS errors — confirmed already fixed)
- Stripe audit (setup fee code exists, env vars needed)
- Decorative button audit (14 non-functional buttons across 4 pages)
- Existing API route patterns (`app/api/documents/download/route.ts`)
- Existing server action patterns (`lib/actions/incidents.ts`, `lib/actions/documents.ts`)

## Validation Criteria
- [ ] All 6 report export buttons trigger PDF downloads
- [ ] Incidents export button works (CSV + PDF in modal)
- [ ] Incident edit flow saves changes to database
- [ ] "Mark All as Read" updates alert state
- [ ] "Load Earlier Alerts" loads more alerts
- [ ] "View Source" opens regulation URL
- [ ] 2FA button shows "coming soon" toast
- [ ] Stripe checkout returns 400 when env vars missing (not cryptic error)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Feature audit >= 95% functional
