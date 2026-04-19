# protekon-dashboard-v3-wave-1 Plan (revised)

## Objective
Wire the shipped backend into the v3 dashboard stubs and add the **3 genuinely missing pieces** (reporting clock on incidents, acknowledgments, team/roles). No greenfield reinvention — the existing 4,600-line `lib/actions/*` layer, Inngest pipeline, `audit_log` table, and `alerts` table already cover most of what Wave 1 needs.

## Reality check — what shipped vs. what I previously planned

| Component | Shipped? | Status |
|---|---|---|
| `audit_log` table + active writes on incident events | ✅ | In use. My plan proposed `audit_events` — that's a duplicate; **reuse `audit_log`**. |
| `alerts` table + `getUnreadCount`, `getAlerts`, `markAlertRead`, `dismissAlert` | ✅ | Full notifications layer. Wire `getUnreadCount` → sidebar `criticalCount`. |
| `incidents` table + `createIncident`/`getIncidents`/`updateIncident` + Inngest `compliance/incident.reported` pipeline | ✅ | Write path complete. **Missing: `reported_at` column** + `getOpenReportableIncident` selector + retention trigger. |
| `lib/pdf-training.ts` signoff PDF generator | ✅ | Template for ACK signer. Pattern: buffer + filename, return via `new NextResponse(buffer, …)`. |
| `/api/training/signoff/[id]` | ✅ | Auth'd PDF download. ACK signer reuses the pattern but with token auth (public). |
| `/api/export/incidents`, `/api/export/audit-package`, `/api/export/report` | ✅ | Audit Trail surface just needs a UI that reads the existing `audit_log` + uses these for export. |
| `lib/actions/sites.ts`, `documents.ts`, `calendar.ts`, `settings.ts`, `scheduled-deliveries.ts` | ✅ | All exist — Waves 2–5 UI-only for these. Reduce future wave scope. |
| Multi-user per client (`user_roles` table, teammate invites) | ❌ | **Architectural gap.** Current model is `client_id === user.id` — one user owns one client, period. Real RBAC = refactor, not a surface. |
| Acknowledgments (policy sign-off flow) | ❌ | Genuinely missing. Net-new. |

## Scope for Wave 1 (revised)

**What we build:**
1. Add `reported_at` + `retained_until` columns to `incidents` + retention trigger (5y per 29 CFR 1904.33).
2. Add `acknowledgment_requests` + `acknowledgments` + `acknowledgment_tokens` tables (net-new — no shipped equivalent).
3. Add `markIncidentReported` + `getOpenReportableIncident` selectors to existing `lib/actions/incidents.ts`.
4. Build `lib/actions/acknowledgments.ts` + `/api/ack/sign/[token]` using the `pdf-training` pattern.
5. Wire `app/dashboard/layout.tsx`: `alerts.getUnreadCount()` → `criticalCount`, `getOpenReportableIncident()` → `incident`. `userRole` stays `'owner'` (matches current single-user-per-client reality — do not fake RBAC).
6. Build 3 surfaces: Incidents (uses shipped actions), Acknowledgments (net-new), Audit Trail (read view over shipped `audit_log` + shipped `/api/export/audit-package`).

**What we defer to a future wave:**
- **Team surface** — depends on multi-user architectural refactor. Not a 1-session surface. Defer to a dedicated "RBAC migration" plan.
- **User roles** — same reason.
- **Incident query in banner showing for other-than-owner roles** — moot until RBAC exists.

## Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead | lead | Orchestrate, enforce ownership |
| DB Builder | builder-db | 2 migrations (incidents extend, acknowledgments) — no new audit table |
| Backend Builder | builder-api | Extend `lib/actions/incidents.ts`, new `lib/actions/acknowledgments.ts`, new `/api/ack/sign/[token]` route |
| Frontend Builder | builder-ui | Wire layout + 3 surfaces + public signer page |
| Validator | validator | tsc, lint, build, RLS smoke |
| Fixer | fixer | Contingent |
| Auditor | auditor | Live browser sweep |

## Contract

### Migration 045 — incidents extend
```sql
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS reported_at timestamptz,
  ADD COLUMN IF NOT EXISTS retained_until timestamptz;

-- Backfill retained_until on existing rows
UPDATE incidents
SET retained_until = incident_date::timestamptz + interval '5 years'
WHERE retained_until IS NULL AND incident_date IS NOT NULL;

-- Trigger: auto-set retained_until on INSERT
CREATE OR REPLACE FUNCTION set_incident_retention()
RETURNS trigger AS $$
BEGIN
  IF NEW.retained_until IS NULL AND NEW.incident_date IS NOT NULL THEN
    NEW.retained_until := NEW.incident_date::timestamptz + interval '5 years';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER incidents_set_retention BEFORE INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION set_incident_retention();

-- Retention guard: reject DELETE while retention window is active
CREATE OR REPLACE FUNCTION guard_incident_delete()
RETURNS trigger AS $$
BEGIN
  IF OLD.retained_until IS NOT NULL AND OLD.retained_until > now() THEN
    RAISE EXCEPTION 'Cannot delete incident %: retention window active until %',
      OLD.incident_id, OLD.retained_until USING ERRCODE = '23514';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER incidents_guard_delete BEFORE DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION guard_incident_delete();
```
Note: the **existing severity column is free-text** (not enum). Do NOT refactor it in Wave 1 — `getOpenReportableIncident` filters with a severity-in-list check instead.

### Migration 046 — acknowledgments
```sql
CREATE TABLE acknowledgment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  policy_document_id uuid NOT NULL,    -- references documents table (existing)
  policy_version text NOT NULL,
  cohort_note text,                    -- free-text until team surface ships
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES acknowledgment_requests(id) ON DELETE CASCADE,
  signer_name text NOT NULL,
  signer_email text,                   -- optional for record-keeping
  signed_at timestamptz NOT NULL DEFAULT now(),
  signature_image_url text NOT NULL,   -- Vercel Blob
  signed_pdf_url text NOT NULL,        -- Vercel Blob
  sha256_hash text NOT NULL,
  ip inet NOT NULL,
  user_agent text NOT NULL
);

CREATE TABLE acknowledgment_tokens (
  token text PRIMARY KEY,              -- 32-byte random URL-safe
  request_id uuid NOT NULL REFERENCES acknowledgment_requests(id) ON DELETE CASCADE,
  assigned_to text,                    -- free-text name/email; becomes user_id when RBAC ships
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

-- RLS
ALTER TABLE acknowledgment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgment_tokens ENABLE ROW LEVEL SECURITY;

-- Client-scoped SELECT for owner (current single-user-per-client model)
CREATE POLICY ack_req_select ON acknowledgment_requests
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY ack_req_insert ON acknowledgment_requests
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY ack_select ON acknowledgments
  FOR SELECT TO authenticated
  USING (request_id IN (SELECT id FROM acknowledgment_requests WHERE client_id = auth.uid()));

-- No UPDATE policy on acknowledgments (immutability by absence)
-- No DELETE policy on acknowledgments (retention by absence)

-- Tokens: server-only (service role)
CREATE POLICY ack_tokens_select ON acknowledgment_tokens
  FOR SELECT TO authenticated
  USING (false);
```

### Extended `lib/actions/incidents.ts`
Add two selectors + one action (do NOT rewrite existing):
```ts
export async function markIncidentReported(
  incidentId: string
): Promise<ActionResult> {
  // Updates reported_at = now() for the given incident_id.
  // Writes to audit_log with event_type = 'incident.reported_to_authority'.
}

export async function getOpenReportableIncident(
  clientId: string
): Promise<Incident | null> {
  // SELECT most recent incident WHERE client_id = ? AND reported_at IS NULL
  // AND severity IN ('fatality','hospitalization','amputation','eye_loss','serious','in_patient')
  //   -- match both new-spec and existing-data severity values
  // ORDER BY incident_date DESC LIMIT 1
}
```

### New `lib/actions/acknowledgments.ts`
```ts
export async function createAckCampaign(input: {
  policyDocumentId: string;
  policyVersion: string;
  cohortNote?: string;
  dueDate?: string;
  assignees: Array<{ name: string; email?: string }>;
}): Promise<{ requestId: string; tokenUrls: string[] }>;

export async function listCampaigns(): Promise<AckCampaign[]>;
export async function getCampaignStatus(requestId: string): Promise<{
  total: number; signed: number; pending: number;
}>;
```

### New `/api/ack/sign/[token]/route.ts`
Mirror of `/api/training/signoff/[id]` but token-gated (no auth):
- `GET` — returns policy PDF preview + metadata (policy name, assignee name, due date)
- `POST` — accepts `{ signatureDataUrl, signerName, ip, userAgent }`, validates token, generates stitched PDF via `lib/pdf-training.ts` pattern, uploads to Vercel Blob, inserts acknowledgment row, marks token used, writes `audit_log` with event_type `acknowledgment.signed`.

### Layout wiring (`app/dashboard/layout.tsx`)
Replace 2 of 3 hardcoded TODOs (leave `userRole: "owner"` — matches current model):
```ts
const [criticalCount, incident] = await Promise.all([
  getUnreadCount().then(r => r.count).catch(() => 0),
  getOpenReportableIncident(user.id).catch(() => null),
]);
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-db | `supabase/migrations/045_incidents_extend.sql`, `046_acknowledgments.sql` | Everything else |
| builder-api | `lib/actions/incidents.ts` (append only — never delete existing exports), `lib/actions/acknowledgments.ts` (new), `app/api/ack/sign/[token]/route.ts` (new) | `lib/actions/alerts.ts` (already perfect), anything marked shipped |
| builder-ui | `app/dashboard/layout.tsx` (surgical 2-line edit), `app/dashboard/incidents/**`, `app/dashboard/acknowledgments/**`, `app/dashboard/audit-trail/**`, `app/ack/[token]/**`, `components/v2/incidents/**`, `components/v2/acks/**` | `lib/`, `app/api/`, `supabase/`, `lib/v2/coverage-resources/**` |

## Tasks

### W1-R1: DB — incidents extend (reported_at + retention)
- **Owner:** builder-db
- **Input:** Contract migration 045
- **Output:** `supabase/migrations/045_incidents_extend.sql`
- **Dependencies:** none
- **Instructions:**
  Read migrations 001, 011, 026 first to confirm current `incidents` schema before adding columns. Use `ADD COLUMN IF NOT EXISTS`. Backfill `retained_until` for existing rows. Create retention trigger + delete guard. Do NOT alter the existing severity column (free-text) — downstream selector handles both value sets.

### W1-R2: DB — acknowledgments schema
- **Owner:** builder-db
- **Input:** Contract migration 046
- **Output:** `supabase/migrations/046_acknowledgments.sql` with 3 tables + RLS
- **Dependencies:** none (can run parallel with R1)
- **Instructions:**
  RLS: client-scoped for SELECT on requests + acknowledgments via `client_id = auth.uid()` (matches current single-user-per-client model). NO update policy on `acknowledgments` (immutability). NO delete policy (retention). `acknowledgment_tokens` is service-role only. Use `gen_random_uuid()`.

### W1-R3: Backend — incidents selectors + markReported
- **Owner:** builder-api
- **Input:** Migration 045 applied, existing `lib/actions/incidents.ts` (159 lines — read it first)
- **Output:** 2 new named exports in `lib/actions/incidents.ts`: `getOpenReportableIncident(clientId)`, `markIncidentReported(incidentId)`
- **Dependencies:** W1-R1
- **Instructions:**
  APPEND to existing file — do NOT refactor `createIncident`/`getIncidents`/`updateIncident`. `markIncidentReported` also writes to `audit_log` with `event_type = 'incident.reported_to_authority'` (matches existing audit conventions). `getOpenReportableIncident` severity filter must accept both new-spec values (`fatality`, `hospitalization`, `amputation`, `eye_loss`) AND existing free-text values that map to reportable (`serious`, `in_patient`, `fatal`) — use `.in('severity', [...])`.

### W1-R4: Backend — acknowledgments actions + public signer API
- **Owner:** builder-api
- **Input:** Migration 046 applied, existing `lib/pdf-training.ts` (read as template), `/api/training/signoff/[id]/route.ts` (read as template)
- **Output:**
  - `lib/actions/acknowledgments.ts` — `createAckCampaign`, `listCampaigns`, `getCampaignStatus`
  - `app/api/ack/sign/[token]/route.ts` — GET (preview) + POST (sign)
- **Dependencies:** W1-R2
- **Instructions:**
  Reuse the `lib/pdf-training.ts` buffer/filename pattern for stitched signed PDFs — copy-adapt, do not refactor the training one. Token auth only — no Supabase session required on the signer endpoint. Validate: token exists, not expired, not used. After sign: upload to Vercel Blob private (use `put` from `@vercel/blob`), sha256 the buffer, INSERT acknowledgment row, UPDATE token.used_at. Write `audit_log` row (`event_type = 'acknowledgment.signed'`).

### W1-R5: Frontend — layout wiring + 3 surfaces + signer page
- **Owner:** builder-ui
- **Input:** Backend from R3 + R4, primitives from v3
- **Output:**
  - Edit `app/dashboard/layout.tsx`: wire `criticalCount` via existing `getUnreadCount`, wire `incident` via new `getOpenReportableIncident`. Keep `userRole: "owner"` hardcoded with a comment explaining the single-user-per-client model. Promise.all both fetches, fail open on error.
  - `app/dashboard/incidents/page.tsx` + components/v2/incidents/{IncidentTable,NewIncidentModal,MarkReportedDialog}.tsx using existing `createIncident` (FormData), new `markIncidentReported`, existing `getIncidents`
  - `app/dashboard/acknowledgments/page.tsx` + components/v2/acks/{CampaignTable,NewCampaignModal}.tsx
  - `app/ack/[token]/page.tsx` — public, no sidebar, no banner, canvas signature capture, POST to `/api/ack/sign/[token]`
  - `app/dashboard/audit-trail/page.tsx` — reads from existing `audit_log` table via a new thin server action `listAuditLog(filters)` added to a new `lib/actions/audit-trail.ts`, plus "Export" button linking to existing `/api/export/audit-package`. (This is a read-only view — creating `lib/actions/audit-trail.ts` with ~30 lines is fine for this task.)
- **Dependencies:** W1-R3, W1-R4
- **Instructions:**
  Use `PageHeader`, `Card`, `PriorityPill`, `CTAButton` primitives. Severity pill tones for incidents: `fatality|hospitalization|amputation|eye_loss|serious|fatal|in_patient` → `enforcement`; anything else → `steel`. Signer page canvas: touch + mouse, export PNG base64, POST with JSON. Do NOT fetch incident data on the client — all server components. Audit Trail UI: table with Actor / Event / Description / Date columns. Filters: event_type (from distinct query), date range. Export button just `<Link href="/api/export/audit-package">`. Wire layout's `userRole` hardcoded with: `// userRole: single-user-per-client — all authenticated users are owners of their own client; real RBAC is a future wave`.

### W1-R6: Validate
- **Owner:** validator
- **Input:** All builder outputs + migrations applied
- **Output:** Quality gate report
- **Dependencies:** W1-R5
- **Instructions:**
  `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`. Migration push dry-run. Smoke: as an authenticated client user, can you (a) create incident → see it listed, (b) mark-reported → banner hides, (c) create ack campaign → visit token URL in incognito → sign → acknowledgment row appears, (d) view Audit Trail → see rows for every action above. Retention smoke: attempt DELETE on an incident — expect SQL error.

### W1-R7: Fix (contingent on R6 failures)
- **Owner:** fixer
- **Input:** Validator failures
- **Output:** Iterative commits
- **Dependencies:** W1-R6

### W1-R8: Audit — live browser sweep
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional rate report + screenshots
- **Dependencies:** W1-R6 (+ R7 if run)
- **Instructions:**
  Live session via agent-browser. 4 scripted flows:
  1. Open /dashboard — no banner (no open reportable) — sidebar shows current alert count from `getUnreadCount`.
  2. /dashboard/incidents → "New incident" → severity=fatality, date=today → submit → verify banner appears with jurisdiction from client's state → click "Report now" → mark reported → banner hides.
  3. /dashboard/acknowledgments → "New campaign" → pick policy + add 1 assignee → submit → copy token URL → open in incognito → draw signature → submit → verify "Signed" state.
  4. /dashboard/audit-trail → verify rows for incident.reported, incident.reported_to_authority, acknowledgment.signed exist → click Export Audit Package → PDF downloads.
  Target ≥95% functional.

## Execution Order
```
W1-R1 (DB: incidents extend) ─┐
W1-R2 (DB: acknowledgments) ──┤   ← run in parallel
                               │
       ┌───────────────────────┘
       ▼
W1-R3 (Backend: incidents selectors) ─┐
W1-R4 (Backend: ack actions + API) ───┤   ← parallel (different files)
                                       │
       ┌───────────────────────────────┘
       ▼
W1-R5 (Frontend: layout + 3 surfaces + signer)
       │
       ▼
W1-R6 (Validate)
       │
       ├─▶ W1-R7 (Fix — contingent)
       ▼
W1-R8 (Audit)
```

**8 tasks total** (down from 16). ~1 focused session.

## Validation Criteria
- [ ] Migrations 045–046 apply cleanly
- [ ] Retention trigger rejects DELETE when `retained_until > now()`
- [ ] Existing `createIncident`/`getIncidents`/`updateIncident`/Inngest pipeline untouched
- [ ] `lib/actions/alerts.ts` not modified
- [ ] `lib/pdf-training.ts` not modified (copy-adapted for ACK)
- [ ] Layout renders banner when an unreported serious incident exists, hides when reported
- [ ] Sidebar bell shows real critical count from `getUnreadCount`
- [ ] Public `/ack/[token]` works in incognito with no session
- [ ] Audit Trail surface shows `audit_log` rows without any new table migration
- [ ] No diff in `lib/v2/coverage-resources/**`, `supabase/migrations/001–044`, any existing action file other than `incidents.ts` (append-only)
- [ ] `pnpm build` passes
- [ ] Auditor ≥95% functional

## Deferred to future plans (NOT Wave 1)

### RBAC migration (its own plan)
Refactor from `client_id === user.id` to a proper `user_roles` join. Blocks:
- Team surface (app/dashboard/team/)
- Role-scoped banner content (field_lead vs compliance_manager copy)
- Signer identity binding (tokens assigned to specific users, not free-text)
This is architectural, not a surface. Plan separately.

### Wave 2 — Subs cluster
Projects, COI (upload API already shipped — only UI needed), Sub Onboarding, Vendor Risk, Safety Programs, 1099-NEC. Mostly UI + `subcontractors`/`projects` model.

### Wave 3 — Intelligence
Reg Changes, Rulemaking, Peer Benchmarks, Knowledge Base. Needs ingest infra.

### Wave 4 — Remaining My Business (mostly UI-only per discovery)
- **Training** — `lib/pdf-training.ts` exists; needs table? Check `training_records` schema first.
- **Calendar** — `lib/actions/calendar.ts` shipped — UI-only.
- **Documents** — `lib/actions/documents.ts` + `/api/upload` + `/api/documents/download` shipped — UI-only to replace stub.
- **My Business Settings** — `lib/actions/settings.ts` + `sites.ts` shipped — UI-only to replace stub.

### Wave 5 — Account
- **Scheduled Reports** — `lib/actions/scheduled-deliveries.ts` shipped — UI-only.
- **Integrations** — OAuth cards, genuinely new.

### Sizing reality (revised)
| Wave | Estimated sessions | Rationale |
|---|---|---|
| 1 (this plan) | 1 | Mostly wiring + 2 migrations + 1 public endpoint |
| 2 Subs | 3–4 | Net-new data model, multiple integrations |
| 3 Intelligence | 3 | Ingest crons + curator UI |
| 4 My Business UIs | 1–2 | **Mostly UI wiring — backend already shipped** |
| 5 Account | 1 | Scheduled reports UI + OAuth cards |
| RBAC refactor | 1–2 (own plan) | Needed before Wave 1's Team surface |
| **Total** | ~10–13 sessions | Down from my earlier 14-session estimate, because shipped backend removes ~1/3 of the work |

## Handoff
Ready for: `/build "specs/protekon-dashboard-v3-wave-1-plan.md"`
