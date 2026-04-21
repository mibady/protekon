# Team Plan — Onboarding Wizard (Perfect First 20 Minutes)

**Spec owner:** Ian
**Workflow:** Backend-First
**Phase covered:** 1A + 1B (foundation + wizard steps with manual-entry paths)
**Out of scope:** Phase 2 (external integrations), Phase 3 (post-onboarding email drip / command palette)
**Created:** 2026-04-21

---

## Objective

Replace the legacy `/intake` flow with a 7-step onboarding wizard that:

1. Takes any business owner across all 27 verticals from signup → populated dashboard in under 20 minutes.
2. Dynamically adapts step copy, required documents, and visible steps based on the client's vertical (no construction-specific terminology for non-construction clients).
3. Shows a live "Dashboard Preview" panel that fills in as the user progresses.
4. Ships with **manual-entry paths for every step** — external integrations (Gmail, QuickBooks, myCOI, etc.) are stubbed for Phase 2.

No existing paying users — hard cutover, no feature flag. `/intake` routes are removed and `/onboarding` is the single entry point post-signup.

---

## Non-Goals (Deferred)

| Feature | Deferred to |
|---|---|
| Gmail/Outlook email scan OAuth + scan pipeline | Phase 2 |
| Google Drive/OneDrive/Dropbox OAuth + OCR classification | Phase 2 |
| QuickBooks/Sage Intacct/Foundation vendor+project sync | Phase 2 |
| myCOI/Evident/Procore/Billy one-way migration | Phase 2 |
| Day 1/2/3/5/7 post-onboarding email drip | Phase 3 |
| Command palette (`?` / `Cmd+K`) | Phase 3 |
| Inline explainer pills (Cal/OSHA citations) | Phase 3 |
| Fix `auth/user.signed-up` never firing | Separate PR — not blocking wizard |
| Rename `construction_subs` → `third_parties` | Separate PR — Phase 5 covers gating, rename is cosmetic |
| Partner-portal `sendAssessment` stub | Separate PR — parallel, not blocking |

---

## Architectural Decisions

### D1. Vertical config — code-driven, mirroring Template Architecture

One TypeScript file per vertical under `lib/onboarding/verticals/<slug>.ts`. Exports a typed `OnboardingVerticalConfig`:

```ts
type OnboardingVerticalConfig = {
  slug: VerticalSlug;                       // FK match to verticals.slug
  label: string;                            // display
  peopleTerminology: {
    worker: string;                         // "Worker" | "Employee" | "Team Member" | "Associate"
    team: string;                           // "Team" | "Staff" | "Crew"
    thirdParty: string | null;              // "Subcontractor" | "Vendor" | "Partner" | null
  };
  stepVisibility: {
    sites: boolean;                         // false for single-location verticals like personal_services
    thirdParties: boolean;                  // true only for verticals with vendor/sub management
  };
  requiredDocCategories: string[];          // e.g. ["ghs_sds", "iipp", "heat_illness"] for construction
  recommendedDocCategories: string[];
  automations: {                            // toggles shown in Step 7 — vertical-filtered
    expirationSweep: boolean;
    regulatoryAlerts: boolean;
    thirdPartyCoiRequests: boolean;
  };
  stepCopy: {
    businessSnapshot: { intro: string; workerCountLabel: string };
    sites: { intro: string; addButtonLabel: string };
    people: { intro: string; workerImportHelp: string };
    thirdParties?: { intro: string; classificationHelp: string }; // only when stepVisibility.thirdParties
    documents: { intro: string; templateLibraryCta: string };
    automations: { intro: string };
  };
};
```

Rationale: matches the existing pattern documented in `docs/TEMPLATE-ARCHITECTURE.md` (sections in code, metadata in DB, one-way sync). Type-safe, no DB query during wizard navigation, analytics sync is one-way code → DB via a sync script.

Ship Phase 1A with 3 fully-configured verticals: `construction`, `manufacturing`, `healthcare`. The remaining 23 verticals inherit a `DEFAULT_CONFIG` and are refined incrementally (separate follow-up tickets).

### D2. `primary_trade` dropped — use existing `clients.vertical`

"Trade" in the current code is a construction-only landing-page routing variant (`lib/landing-configs/trades/*.ts`) not a client attribute. Do not add `primary_trade` to `clients`. Step 1 collects `vertical` (dropdown of 26 canonical verticals from `public.verticals`). If vertical-within-vertical classification becomes needed, use the new `clients.vertical_metadata JSONB` column (added in migration 046 below).

### D3. Subcontractors storage — gate Step 5 by vertical, reuse `construction_subs`

`construction_subs` already has `v_construction_subs_dashboard` as canonical read path (Session 27 decision). Step 5 is shown only when `stepVisibility.thirdParties` is true in the vertical config. For Phase 1, that's construction only. The step writes to `construction_subs`. When more verticals need vendor management (facilities_mgmt, property_mgmt), a separate PR renames `construction_subs → third_parties` with a compatibility view.

### D4. Intake pipeline — wizard fires `compliance/intake.submitted` after Step 6

Don't rebuild scoring/doc-gen/48h-wait. The existing `intake-pipeline.ts` works. Step 6 of the new wizard fires `compliance/intake.submitted` with the assembled payload from Steps 1-6. Step 7 fires `onboarding/automations.configured`. This keeps the Inngest function surface stable — we're just replacing the form on top of it.

### D5. Dashboard Preview — server component reading same data as `/dashboard`

The "live preview" panel (right rail on every wizard step) is a trimmed `/dashboard` render that reads from the same Supabase tables. After each step, `router.refresh()` re-fetches. No separate preview data model — a single source of truth avoids drift.

### D6. Phase 2 integration stubs — capability placeholders, not broken UI

Step 2 ("Connect Your Tools") ships with 4 cards (Email, Cloud Drive, Accounting, Existing Compliance Tool). Each card has a "Coming soon" badge and a "Skip for now" primary action. Clicking a connector card opens a modal explaining what will be imported when the integration ships (captures opt-in for Phase 2 rollout). No half-built OAuth flows in production.

---

## Database Schema (Migration `051_onboarding_wizard.sql`)

**Pre-existing tables we REUSE (do not recreate):**

| Existing table | From migration | Use for wizard |
|---|---|---|
| `sites` | 025 | Step 3 (Sites) — already has `client_id`, `name`, `address`, `city`, `state`, `zip`, `employee_count`, `is_primary`. RLS enabled. No changes needed for Phase 1A. |
| `integrations` | 050 | Step 2 (Connect Tools) — columns: `provider` (text, not enum), `status` (connected/disconnected/error), `account_label`, `scopes` (text[]), `encrypted_access_token/encrypted_refresh_token` (bytea), `connected_at`, `last_sync_at`, `error_message`. **Deny-all RLS to authenticated** — server actions must use admin client. |
| `user_roles` | 047 | Step 4 (invite team) — client-scoped RBAC: `user_id`, `client_id`, `role` (owner/compliance_manager/field_lead/auditor), `invited_at/invited_by/activated_at/deactivated_at`. Perfect fit — do not replicate. |
| `construction_subs` + `sub_onboarding_tokens` | pre-existing | Step 5 (gated to construction) |

**New table this migration adds:** `workers` only.

### `clients` table additions

```sql
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS operating_states text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS worker_count_range text CHECK (worker_count_range IN ('1-10','11-50','51-200','200+')),
  ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'not_started'
    CHECK (onboarding_status IN ('not_started','in_progress','completed','abandoned')),
  ADD COLUMN IF NOT EXISTS last_onboarding_step_completed smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vertical_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;
```

Note: `vertical`, `plan`, `status`, `stripe_customer_id`, `compliance_score`, `risk_level`, `v2_enabled` all already exist.

### New table: `workers`

Workers = individual field employees who may not have login accounts. Distinct from `user_roles` (which maps auth users to clients with RBAC). Step 4 separates "Invite team" (writes to `user_roles`) from "Import workers" (writes to `workers`).

```sql
CREATE TABLE workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text,                              -- free-text; terminology driven by vertical config ("Electrician"/"Nurse"/"Shift Lead")
  hire_date date,
  phone text,
  email text,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX workers_client_id_idx ON workers(client_id);
CREATE INDEX workers_site_id_idx ON workers(site_id);
CREATE INDEX workers_auth_user_id_idx ON workers(auth_user_id);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Mirror RLS pattern from sites table (migration 025)
CREATE POLICY workers_select_own ON workers FOR SELECT TO authenticated
  USING (client_id = auth.uid());
CREATE POLICY workers_insert_own ON workers FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());
CREATE POLICY workers_update_own ON workers FOR UPDATE TO authenticated
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY workers_delete_own ON workers FOR DELETE TO authenticated
  USING (client_id = auth.uid());
```

### Integration-type mapping (Step 2 stub)

Since `integrations.provider` is free text, map wizard "type" labels to provider strings. Keep the mapping in `lib/onboarding/integration-providers.ts`:

```ts
export const INTEGRATION_PROVIDERS = {
  gmail: 'gmail',
  outlook: 'outlook',
  google_drive: 'google_drive',
  onedrive: 'onedrive',
  dropbox: 'dropbox',
  quickbooks: 'quickbooks',
  sage_intacct: 'sage_intacct',
  foundation: 'foundation',
  mycoi: 'mycoi',
  evident: 'evident',
  procore: 'procore',
  billy: 'billy',
} as const;
```

Phase 1A Step 2 writes rows with `provider=<mapped>, status='disconnected', connected_at=null` + `account_label='requested'` to indicate opt-in intent. Phase 2 flips `status` to `connected` and populates token columns. **Server action MUST use admin client** — RLS on `integrations` is deny-all to authenticated.

---

## API Surface

### Server actions (`lib/actions/onboarding/`)

| File | Exports | Contract |
|---|---|---|
| `business-snapshot.ts` | `submitBusinessSnapshot(input)` | Step 1. Writes `vertical`, `operating_states`, `worker_count_range` to clients. Fires `onboarding/business.snapshot.submitted`. |
| `connect-tools.ts` | `recordToolIntent(providerKey)` | Step 2 stub. Upserts `integrations` row via **admin client** (RLS is deny-all). Maps providerKey → `provider` text. Sets `status='disconnected'`, `account_label='requested'`. |
| `sites.ts` | `upsertSites(sites[])`, `deleteSite(id)` | Step 3. Bulk upsert to existing `sites` table (migration 025). Enforces exactly one `is_primary` per client. |
| `workers.ts` | `importWorkers(workers[])`, `inviteTeamMember(email, role)` | Step 4. `importWorkers` → `workers` table. `inviteTeamMember` → existing `user_roles` table (migration 047) with `role` enum (owner/compliance_manager/field_lead/auditor). Invite flow uses Supabase Auth. |
| `third-parties.ts` | `upsertThirdParties(records[])`, `requestOnboardingPacket(id)` | Step 5. Writes to `construction_subs` when vertical=construction. Fires `sub_onboarding.invite.sent` per existing pattern. |
| `documents.ts` | `approveImportedDocument(id)`, `adoptTemplate(category)`, `markDocumentSkipped(category)` | Step 6. Hooks into existing doc generation. |
| `automations.ts` | `configureAutomations(toggles)`, `scheduleInitialActions(actions[])` | Step 7. Writes to `clients.vertical_metadata.automations`. Fires `onboarding/automations.configured`. Fires `compliance/intake.submitted` here (end of wizard). |
| `state.ts` | `getOnboardingState()`, `advanceStep(n)`, `markComplete()` | Wizard state machine. Reads/writes `onboarding_status`, `last_onboarding_step_completed`. |

### HTTP routes (`app/api/onboarding/`)

Only for file uploads (server actions handle everything else):

- `app/api/onboarding/documents/upload/route.ts` — multipart → Vercel Blob → `documents` table row.
- `app/api/onboarding/workers/csv/route.ts` — CSV parse → preview rows (client confirms before `importWorkers` server action).

### Inngest events (all under `inngest/functions/onboarding/`)

| Event | Handler | Purpose |
|---|---|---|
| `onboarding/business.snapshot.submitted` | `prebuild-context.ts` | Pre-warm regulatory feed + seed 8-12 knowledge-base articles based on vertical + states. |
| `onboarding/sites.submitted` | (none — CRUD-only) | Reserved for Phase 2 site-geocoding enrichment. |
| `onboarding/people.imported` | `send-team-invites.ts` | Fan out Supabase Auth invite emails. |
| `onboarding/third-parties.imported` | (existing `sub_onboarding_invite` reused) | No new handler. |
| `onboarding/automations.configured` | `finalize-onboarding.ts` | Stamps `onboarded_at`, sets `onboarding_status='completed'`, fires `compliance/intake.submitted`. |

---

## Frontend Surface

### Routes

```
app/onboarding/
├── layout.tsx               # WizardLayout — handles progress rail + preview panel, redirects to /dashboard if onboarded
├── page.tsx                 # Redirect to current step
├── business/page.tsx        # Step 1
├── tools/page.tsx           # Step 2
├── sites/page.tsx           # Step 3 (hidden if vertical.stepVisibility.sites=false)
├── people/page.tsx          # Step 4
├── subs/page.tsx            # Step 5 (hidden if vertical.stepVisibility.thirdParties=false)
├── documents/page.tsx       # Step 6
└── automations/page.tsx     # Step 7
```

### Components (`components/onboarding/`)

| Component | Purpose |
|---|---|
| `WizardLayout.tsx` | Two-column: steps (left 60%) + DashboardPreview (right 40%). Sticky progress rail at top. |
| `ProgressRail.tsx` | 7 step indicators, current/complete/skipped states, direct jump. |
| `DashboardPreview.tsx` | Shrunken `/dashboard` render. Reads live data. Labels sample sections with "Sample — replace by connecting X." |
| `StepShell.tsx` | Card wrapper: intro copy (from vertical config), body slot, skip/back/next footer. |
| `SkipConsequencesDialog.tsx` | Modal shown when user clicks Skip on a costly step. |
| `step-1-business-snapshot/` | Trade dropdown, states multi-select, worker-count slider. |
| `step-2-connect-tools/` | 4 connector cards, each opens a ComingSoonModal. |
| `step-3-sites/` | Site list + add form. Google Places autocomplete deferred to Phase 2 (manual address for now). |
| `step-4-people/` | Team invites + worker CSV upload + worker manual entry. |
| `step-5-third-parties/` | Vendor list manual entry + "request onboarding packet" per-row. |
| `step-6-documents/` | 3-column review board: Needs eye / Looks good / Still needed. |
| `step-7-automations/` | 3 toggles + 2 scheduled-action cards + launch button. |

### Signup page trim (`app/signup/page.tsx`)

Reduce to: email + password (or SSO) + company name. Remove industry, employee count, plan selection, location count — those move to the wizard. After signup, redirect to `/onboarding/business`.

### Remove

- `app/intake/` — entire directory (replaced by `/onboarding`).
- `lib/actions/intake.ts` — wizard's `automations.ts` server action fires `compliance/intake.submitted` now.

---

## File Ownership

Strict ownership to prevent merge conflicts with parallel builders:

### Backend Builder

```
supabase/migrations/046_onboarding_wizard.sql
lib/types/onboarding.ts
lib/onboarding/verticals/
  ├── types.ts
  ├── default.ts
  ├── construction.ts
  ├── manufacturing.ts
  ├── healthcare.ts
  └── index.ts                    (barrel + resolver: getConfig(slug) with DEFAULT fallback)
lib/actions/onboarding/
  ├── business-snapshot.ts
  ├── connect-tools.ts
  ├── sites.ts
  ├── workers.ts
  ├── third-parties.ts
  ├── documents.ts
  ├── automations.ts
  └── state.ts
app/api/onboarding/documents/upload/route.ts
app/api/onboarding/workers/csv/route.ts
inngest/functions/onboarding/
  ├── prebuild-context.ts
  ├── send-team-invites.ts
  └── finalize-onboarding.ts
inngest/types.ts                  (add new event names)
inngest/client.ts                 (register new functions)
```

### Frontend Builder

```
app/onboarding/                   (all files under this path)
app/signup/page.tsx               (trim only — reads vertical config surface)
components/onboarding/            (all files under this path)
```

### Shared (read-only imports)

- `lib/onboarding/verticals/*` — frontend imports config; backend reads it for validation.
- `lib/types/onboarding.ts` — both sides import types.

### Removed

- `app/intake/**` — deletion owned by Backend Builder.
- `lib/actions/intake.ts` — deletion owned by Backend Builder.

---

## Contract (the wire between Backend and Frontend)

Frozen before any parallel work begins:

1. **Vertical config type** — `lib/onboarding/verticals/types.ts` is written first. Both builders import it. Changes require coordination.
2. **Server action signatures** — each server action exports a typed `input` and `result` shape. Documented in `lib/actions/onboarding/*.ts` JSDoc-free — the types themselves are the contract.
3. **Wizard state** — `getOnboardingState()` returns:
   ```ts
   type OnboardingState = {
     currentStep: number;               // 0-7 (0 = not started, 7 = launched)
     completedSteps: number[];
     skippedSteps: number[];
     client: {
       id: string;
       vertical: VerticalSlug | null;
       operatingStates: string[];
       workerCountRange: string | null;
       onboardingStatus: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
     };
     config: OnboardingVerticalConfig;  // resolved via getConfig(client.vertical ?? 'default')
     preview: {
       sitesCount: number;
       workersCount: number;
       thirdPartiesCount: number;
       documentsCount: number;
       postureScore: number | null;     // null until Step 6 completes
     };
   };
   ```
4. **Dashboard Preview data** — reads from `getOnboardingState().preview`. No additional API calls from the preview component.

---

## Task Breakdown

### Phase 1A — Foundation (must ship before Phase 1B)

| # | Task | Owner | Blocks | Files |
|---|---|---|---|---|
| T1 | Write migration `051_onboarding_wizard.sql` (clients columns + new workers table + RLS) | Backend | T2, T3 | supabase/migrations/051 |
| T2 | Write `lib/types/onboarding.ts` + `lib/onboarding/verticals/types.ts` | Backend | T3-T12, T13-T20 | lib/types/onboarding.ts, lib/onboarding/verticals/types.ts |
| T3 | Write `lib/onboarding/verticals/{default,construction,manufacturing,healthcare}.ts` + barrel/resolver | Backend | T13, T14 | lib/onboarding/verticals/ |
| T4 | Write `lib/actions/onboarding/state.ts` (getOnboardingState, advanceStep, markComplete) | Backend | T5-T12, T13-T20 | lib/actions/onboarding/state.ts |
| T5 | Write `lib/actions/onboarding/business-snapshot.ts` | Backend | T14 | |
| T13 | Build `WizardLayout`, `ProgressRail`, `StepShell`, `SkipConsequencesDialog` | Frontend | T14-T20 | components/onboarding/ shell |
| T14 | Build Step 1 (business snapshot) page + component | Frontend | | app/onboarding/business, components/onboarding/step-1 |
| T21 | Trim `app/signup/page.tsx` + redirect to /onboarding/business | Frontend | | |
| T22 | Add Inngest event types + register handlers + prebuild-context.ts | Backend | | inngest/types.ts, inngest/client.ts, inngest/functions/onboarding/prebuild-context.ts |
| T23 | Wire `DashboardPreview` to `getOnboardingState().preview` | Frontend | | components/onboarding/DashboardPreview.tsx |
| T24 | Validation gate: tsc + lint + vitest + playwright smoke (wizard entry renders) | Validator | | — |

### Phase 1B — Remaining steps

| # | Task | Owner | Blocks | Files |
|---|---|---|---|---|
| T6 | `connect-tools.ts` server action + ComingSoonModal UX | Backend | T15 | |
| T7 | `sites.ts` server action | Backend | T16 | |
| T8 | `workers.ts` server action + CSV upload route | Backend | T17 | |
| T9 | `third-parties.ts` server action (writes to construction_subs, gated) | Backend | T18 | |
| T10 | `documents.ts` server action + documents upload route | Backend | T19 | |
| T11 | `automations.ts` server action (fires `compliance/intake.submitted` + `onboarding/automations.configured`) | Backend | T20 | |
| T12 | `finalize-onboarding.ts` + `send-team-invites.ts` Inngest functions | Backend | T20 | inngest/functions/onboarding/ |
| T15 | Step 2 (connect tools) page + component | Frontend | | |
| T16 | Step 3 (sites) page + component | Frontend | | |
| T17 | Step 4 (people) page + component + CSV import flow | Frontend | | |
| T18 | Step 5 (third parties) page + component — gated on vertical | Frontend | | |
| T19 | Step 6 (documents) page + 3-column review board | Frontend | | |
| T20 | Step 7 (automations) page + launch button | Frontend | | |
| T25 | Delete `app/intake/**` and `lib/actions/intake.ts` | Backend | T20 | |
| T26 | Playwright E2E: full wizard happy path for vertical=construction, vertical=healthcare | Auditor | T25 | e2e/onboarding-wizard.spec.ts |
| T27 | Validation gate: full quality-pipeline (tsc, lint, test, build) | Validator | T26 | — |
| T28 | Feature audit: `/audit` on `/onboarding/*` — 0 critical, ≥95% functional | Auditor | T27 | — |

---

## Execution Order

```
Phase 1A
  T1 ─┐
  T2 ─┼─→ T3 ─→ T13 ─┬─→ T14 ─→ T21 ─→ T23 ─→ T24
       │              │
       └─→ T4 ────────┘
                      └─→ T22

Phase 1B (all of Phase 1A complete first)
  T6 ─→ T15 ─┐
  T7 ─→ T16 ─┤
  T8 ─→ T17 ─┼─→ T25 ─→ T26 ─→ T27 ─→ T28
  T9 ─→ T18 ─┤
  T10 ─→ T19─┤
  T11 ─→ T20─┘
  T12 (parallel with T11) ─→ T20
```

Phase 1B tasks T6/T7/T8/T9/T10 can run in parallel on the Backend side; T15/T16/T17/T18/T19 can run in parallel on the Frontend side once the matching backend action ships.

---

## Validation Criteria

### Must pass before merge

1. **tsc** clean on the diff (`npm run build` succeeds).
2. **lint** clean on the diff (`npm run lint`).
3. **vitest** unit tests for all 8 server actions, including RLS enforcement (integration test hits real Supabase per feedback memory).
4. **Playwright E2E** `e2e/onboarding-wizard.spec.ts`:
   - Sign up as new user → land on `/onboarding/business`.
   - Complete all 7 steps for vertical=construction → land on `/dashboard` with posture score set.
   - Complete wizard for vertical=healthcare → Step 5 is hidden, wizard still reaches `/dashboard`.
   - Skip Step 2 → SkipConsequencesDialog appears → continuing works.
5. **Feature audit** on `/onboarding/*` (`/audit Onboarding --fix`): 0 critical, ≥95% functional elements wired.
6. **Migration reversible**: `046_onboarding_wizard.sql` has a matching down-migration (drop new tables, drop new columns, drop new RLS policies).

### Success metrics (post-launch, not merge-blocking)

| Metric | Target | Measurement |
|---|---|---|
| Time to first posture score | <15 min median | `onboarded_at - signup_ts` |
| Wizard completion rate | ≥80% | `onboarding_status='completed'` / total signups |
| Step dropoff | <10% per step | Count of `last_onboarding_step_completed = N` |
| Day-1 dashboard density | ≥50% real (non-sample) surfaces | Sample of Day-1 client dashboards |

Phase 2 integration rollout will target the ≥8 documents / ≥70% dashboard density metrics from the original spec — not achievable without Gmail/Drive/QB scanning.

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Vertical config drift — 3 verticals configured, 23 use default | High | Default config is explicit and safe. Separate follow-up ticket per vertical to configure. User research required for terminology per vertical. |
| `construction_subs` naming leaks to non-construction UI | Medium | Wizard Step 5 is gated by `stepVisibility.thirdParties`. Non-construction clients never see the table. Rename deferred. |
| `compliance/intake.submitted` payload shape breaks existing `intake-pipeline.ts` | Medium | Payload matches current `lib/actions/intake.ts:64` contract exactly. Add contract test to verify. |
| Dashboard Preview causes N+1 queries | Low | `getOnboardingState()` does a single batched query returning all preview counts. Preview component reads from returned state, not separate fetches. |
| User signs up but abandons wizard before Step 6 | Expected | `onboarding_status='in_progress'` with `last_onboarding_step_completed`. They return via `/onboarding` and resume at that step. |

---

## Post-Merge Follow-ups (File After Phase 1 Merges)

1. **Configure remaining 23 verticals** — one ticket per vertical for terminology + required docs (user research needed).
2. **Rename `construction_subs → third_parties`** — cosmetic; waits until ≥2 verticals need vendor management.
3. **Phase 2 integrations** — 4 separate PRs (Gmail, Drive, QB, myCOI). Each ~1-2 weeks.
4. **Phase 3 post-onboarding** — email drip Day 1/2/3/5/7 + command palette + "still setting up" widget.
5. **Fix `auth/user.signed-up` event wiring** — separate PR, not onboarding-specific.
6. **Fix Stripe webhook double-welcome-email** — separate PR, unblocked by the wizard change.

---

## Linear

Not connected (`.linear_project.json` has `"project": null`). Tracking lives in this spec + `SESSION_LOG.md` + commit messages.
