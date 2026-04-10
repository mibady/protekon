# Phase 0: Critical Infrastructure — Build Spec

## Overview

Ship the 5 critical infrastructure items before any content launches. Without these, the app has no auth enforcement, no alerts table, no OSHA data bridge, incomplete incident classification, and a nearly empty regulatory feed. These are blockers for every subsequent phase.

**Linear Issues:** NGE-358 through NGE-362
**Priority:** Urgent (all 5)
**Milestone:** Phase 0: Critical Infrastructure

## Layers

- [x] Database: Supabase migrations (alerts table, incidents metadata column)
- [x] Backend: Middleware, OSHA data API client, regulatory sync Inngest function
- [x] AI/HEAD: SB 553 Type 1-4 classifier update, store full classification output
- [ ] Frontend: Not applicable (backend-only phase)

## Team Members

| Agent | Role | Layer |
|-------|------|-------|
| DNA Builder | Database migrations + middleware + OSHA API client | DNA |
| HEAD Builder | AI classifier update + incident metadata storage | HEAD |
| Validator | Type check, lint, test, build | ALL |
| Fixer | Fix any validation failures | ALL |

## Contract

### Shared Types (extend existing)

```ts
// lib/types.ts additions

// --- Alerts (NGE-359) ---
export type AlertType = "regulatory" | "certification" | "incident" | "compliance" | "system"
export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info"

export interface Alert {
  id: string
  client_id: string
  type: AlertType
  title: string
  message: string
  severity: AlertSeverity
  read: boolean
  action_url: string | null
  created_at: string
}

// --- SB 553 Violence Classification (NGE-361) ---
export type ViolenceType = 1 | 2 | 3 | 4
export type PerpRelationship = "stranger" | "client-customer" | "worker" | "personal"

export interface IncidentClassification {
  category: string
  severity: string
  oshaCode: string
  osha300Recordable: boolean
  violenceType: ViolenceType | null       // Only when category = "workplace-violence"
  perpetratorRelationship: PerpRelationship | null
  piiDetected: boolean
  recommendation: string
  followUpTimeline: string
}

// --- OSHA Data API (NGE-360) ---
export interface OshaIndustryProfile {
  naicsCode: string
  industryName: string
  avgPenalty: number
  violationRate: number
  totalViolations: number
  topStandards: { code: string; description: string; count: number }[]
}

export interface OshaNearbyEnforcement {
  activityNr: string
  estabName: string
  city: string
  violationType: string
  penalty: number
  issuanceDate: string
}

export interface OshaBenchmarks {
  industry: string
  penaltyPercentiles: { p25: number; p50: number; p75: number; p90: number }
  clientPercentile: number
}
```

### Environment Variables (needed)

```
# OSHA Data API (new — for NGE-360)
OSHA_API_URL=              # Supabase Edge Function URL on OSHA project
OSHA_API_KEY=              # API key for the edge function
```

## File Ownership

| Agent | OWNS | DOES NOT TOUCH |
|-------|------|----------------|
| DNA Builder | `middleware.ts`, `supabase/migrations/`, `lib/supabase/`, `lib/actions/alerts.ts`, `lib/osha-api.ts`, `inngest/functions/regulatory-sync-bridge.ts` | `lib/ai/`, `components/`, `app/(marketing)/` |
| HEAD Builder | `lib/ai/incident-classifier.ts`, `inngest/functions/incident-report.ts` | `supabase/`, `middleware.ts`, `components/` |

## Tasks

### Task 1: Auth Middleware (NGE-358)
**Agent:** DNA Builder
**Layer:** DNA
**Blocked By:** None

**Instructions:**
Create `middleware.ts` at project root using the existing `lib/supabase/middleware.ts` helper.

Files to create/modify:
- CREATE `middleware.ts` (project root)

Requirements:
- Import and call `updateSession()` from `lib/supabase/middleware.ts`
- Protect: `/dashboard/*`, `/partner/*`
- Protect API routes EXCEPT: `/api/inngest`, `/api/stripe/webhook`, `/api/score/submit`, `/api/samples/gate`, `/api/contact`, `/api/partners/apply`
- Skip: `/_next/`, `/favicon.ico`, static assets
- Redirect unauthenticated users to `/login`
- Export `config.matcher` array

Reference: The Supabase middleware helper already exists at `lib/supabase/middleware.ts` — it handles session refresh. Just call it.

### Task 2: Alerts Table + RLS (NGE-359)
**Agent:** DNA Builder
**Layer:** DNA
**Blocked By:** None (parallel with Task 1)

**Instructions:**
Create the alerts table that the existing `/dashboard/alerts` page expects.

Files to create/modify:
- CREATE `supabase/migrations/010_alerts.sql`
- MODIFY `lib/actions/alerts.ts` — wire to real Supabase queries

Migration schema:
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('regulatory','certification','incident','compliance','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low','info')),
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_client ON alerts(client_id);
CREATE INDEX idx_alerts_unread ON alerts(client_id) WHERE NOT read;

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients update own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "System inserts alerts"
  ON alerts FOR INSERT
  WITH CHECK (true);
```

Update `lib/actions/alerts.ts`:
- `getAlerts(clientId)` — fetch unread + recent read, ordered by created_at desc
- `markAlertRead(alertId)` — set read = true
- `dismissAlert(alertId)` — delete
- `getUnreadCount(clientId)` — count for badge

### Task 3: OSHA Data API Client (NGE-360)
**Agent:** DNA Builder
**Layer:** DNA
**Blocked By:** None (parallel with Tasks 1-2)

**Instructions:**
Create the client that the app uses to query the OSHA database. The actual Supabase Edge Function on the OSHA project is a separate deployment — this task builds the client side.

Files to create/modify:
- CREATE `lib/osha-api.ts`

The client should:
- Read `OSHA_API_URL` and `OSHA_API_KEY` from env
- Export 3 async functions:
  - `getIndustryProfile(naicsCode: string): Promise<OshaIndustryProfile>`
  - `getNearbyEnforcement(lat: number, lng: number, radiusMiles?: number): Promise<OshaNearbyEnforcement[]>`
  - `getBenchmarks(vertical: string): Promise<OshaBenchmarks>`
- Handle errors gracefully (return null on failure, log warning)
- Cache responses with 1-hour TTL (use simple in-memory Map with timestamp)
- Type imports from `lib/types.ts`

### Task 4: SB 553 Classifier + Metadata Storage (NGE-361)
**Agent:** HEAD Builder
**Layer:** HEAD
**Blocked By:** None (parallel with DNA tasks)

**Instructions:**
Two changes to the incident classification pipeline:

**File 1: `lib/ai/incident-classifier.ts`**
- Add `violenceType` field to the Zod schema: `z.enum(["1","2","3","4"]).nullable()` — only populated when category is `workplace-violence`
- Add `perpetratorRelationship` field: `z.enum(["stranger","client-customer","worker","personal"]).nullable()`
- Update the system prompt to instruct Claude: "When the incident category is workplace-violence, you MUST classify the violence type per SB 553 Labor Code §6401.9(d): Type 1 = criminal intent/stranger, Type 2 = customer/client, Type 3 = worker-on-worker, Type 4 = personal relationship. Set violenceType and perpetratorRelationship accordingly. For non-violence incidents, set both to null."
- Update `oshaCode` field description from "OSHA standard" to "Cal/OSHA standard (Title 8 CCR)"

**File 2: `inngest/functions/incident-report.ts`**
- Add migration for `metadata` JSONB column on `incidents` table (create `supabase/migrations/011_incidents_metadata.sql`):
  ```sql
  ALTER TABLE incidents ADD COLUMN IF NOT EXISTS metadata JSONB;
  ```
  **NOTE:** This migration file is owned by HEAD Builder as an exception since it's tightly coupled to the classifier output.
- Update the Supabase insert in the incident-report function to include ALL classification fields in the `metadata` column:
  ```ts
  metadata: {
    category: classification.category,
    oshaCode: classification.oshaCode,
    osha300Recordable: classification.osha300Recordable,
    violenceType: classification.violenceType,
    perpetratorRelationship: classification.perpetratorRelationship,
    piiDetected: classification.piiDetected,
    recommendation: classification.recommendation,
    followUpTimeline: classification.followUpTimeline,
  }
  ```

### Task 5: Regulatory Sync (NGE-362)
**Agent:** DNA Builder
**Layer:** DNA
**Blocked By:** Task 3 (needs OSHA API client)

**Instructions:**
Sync regulatory updates from the OSHA database into the app database.

Files to create/modify:
- CREATE `inngest/functions/regulatory-sync-bridge.ts`
- MODIFY `inngest/functions/regulatory-scan.ts` — add app DB persistence after RSS parsing

New Inngest function `regulatory-sync-bridge.ts`:
- Trigger: event `compliance/regulatory.sync-requested` (manual trigger) OR cron `0 5 * * 0` (weekly Sunday 5am)
- Step 1: Call OSHA API to get all regulatory updates (new endpoint needed, or batch fetch)
- Step 2: Upsert into `regulatory_updates` table, matching on a unique key (source + external_id or title + date)
- Step 3: Log count of new vs. updated rows

Modify existing `regulatory-scan.ts`:
- After parsing RSS feeds and AI analysis, also insert/upsert results into `regulatory_updates` table in the app DB
- Currently the function emails compliance officers but doesn't persist to the app DB

## Execution Order

```
┌──────────────────────────────────────────────────────────┐
│  PARALLEL BLOCK 1 (no dependencies)                      │
│                                                          │
│  Task 1: Auth Middleware ─────────────────── DNA Builder │
│  Task 2: Alerts Table ───────────────────── DNA Builder  │
│  Task 3: OSHA API Client ───────────────── DNA Builder   │
│  Task 4: SB 553 Classifier ─────────────── HEAD Builder  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  SEQUENTIAL (depends on Task 3)                          │
│                                                          │
│  Task 5: Regulatory Sync ───────────────── DNA Builder   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  VALIDATION (depends on all above)                       │
│                                                          │
│  Task 6: Quality Gates ─────────────────── Validator     │
│          tsc → lint → test → build                       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  FIX (if validation fails)                               │
│                                                          │
│  Task 7: Fix Errors ────────────────────── Fixer         │
│          One error at a time → re-validate               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Validation Criteria

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx eslint .` — 0 errors
- [ ] `npx vitest run` — all tests pass
- [ ] `npm run build` — successful build
- [ ] `middleware.ts` exists at project root with correct matcher
- [ ] `supabase/migrations/010_alerts.sql` creates `alerts` table with RLS
- [ ] `supabase/migrations/011_incidents_metadata.sql` adds metadata column
- [ ] `lib/osha-api.ts` exports 3 typed functions
- [ ] `lib/ai/incident-classifier.ts` schema includes `violenceType` and `perpetratorRelationship`
- [ ] `inngest/functions/incident-report.ts` stores full classification in `metadata` JSONB

## References Consulted

- `specs/supabase-schema-auth-wiring.md` — existing auth pattern
- `lib/supabase/middleware.ts` — existing middleware helper
- `lib/ai/incident-classifier.ts` — current classifier (no Type 1-4)
- `inngest/functions/incident-report.ts` — current pipeline (discards classification)
- `inngest/functions/regulatory-scan.ts` — current RSS parser (no app DB persistence)
- `supabase/migrations/001_core_schema.sql` — incidents table definition
- Gap analysis document — full feature audit
