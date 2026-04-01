# Inngest Workflows — Implementation Spec

## Overview

Stage 4 of the backend-first workflow: implement durable Inngest workflows for compliance automation. These handle post-signup onboarding, intake scoring, document generation, incident processing, monthly audits, training reminders, regulatory scanning, and payment failure recovery. Adapted from Shield CaaS with identical patterns.

## Layers

- [ ] Database: No schema changes (all tables exist)
- [x] Backend: Inngest client, 8 functions, API route handler
- [ ] Frontend: No changes (events fired from existing server actions)
- [ ] AI: Not applicable

## Architecture

```
User Action → Server Action → inngest.send(event) → Inngest Function → step.run() chains
                                                                      → Supabase Admin Client
                                                                      → Resend (future)
                                                                      → Vercel Blob (future)
```

All Inngest functions use the **admin Supabase client** (`lib/supabase/admin.ts`) to bypass RLS for batch operations.

## Contract

### Inngest Client

```ts
// inngest/client.ts
export const inngest = new Inngest({ id: "protekon" })
```

### Event Types

```ts
// inngest/types.ts
type Events = {
  "auth/user.signed-up": { data: { userId: string; email: string } }
  "compliance/intake.submitted": { data: { email: string; businessName: string; vertical: string; answers: Record<string, boolean> } }
  "compliance/document.requested": { data: { clientId: string; email: string; businessName: string; documentType: string; vertical: string } }
  "compliance/incident.reported": { data: { clientId: string; businessName: string; incidentData: { description: string; location: string; date: string; severity: string } } }
  "billing/payment.failed": { data: { clientId: string; email: string; businessName: string; amount: number; invoiceId: string } }
}
```

### API Route

```ts
// app/api/inngest/route.ts
// Exports GET, POST, PUT via serve() from "inngest/next"
// Registers all 8 functions
// maxDuration: 300
```

## 8 Inngest Functions

### 1. post-signup — `auth/user.signed-up`
- Ensures client record exists in `clients` table
- Sends welcome email (Resend stub)

### 2. intake-pipeline — `compliance/intake.submitted`
- Scores compliance gaps from intake answers
- Upserts client record with score + risk level
- Generates 3 starter document records
- Sends welcome email (Resend stub)
- Waits 48h, then schedules first audit

### 3. document-generation — `compliance/document.requested`
- Gathers client data + recent audits/incidents
- Generates PDF (pdf-lib stub — creates placeholder record)
- Updates document status from "requested" to "current"
- Sends download notification (Resend stub)

### 4. incident-report — `compliance/incident.reported`
- Strips PII from description (regex for names, emails, phones, SSNs)
- Inserts sanitized record into incidents table
- Notifies compliance officer (Resend stub)
- Waits for follow-up period (severity-based: 24h/72h/7d)
- Schedules follow-up

### 5. monthly-audit — Cron `0 9 1 * *`
- Pulls all active clients
- Runs compliance checks per client (document count, incident count, training status)
- Inserts audit records
- Sends alerts to at-risk clients (Resend stub)

### 6. training-reminders — Cron `0 8 * * 1`
- Checks overdue + upcoming training deadlines
- Sends reminder emails (Resend stub)
- Escalates 2+ week overdue

### 7. regulatory-scan — Cron `0 6 * * *`
- Placeholder scanner for regulatory updates
- Inserts stub records into regulatory_updates

### 8. payment-failed — `billing/payment.failed`
- 3-step escalation: warning → urgent → suspend
- Waits for payment.succeeded events between steps
- Suspends account after 10-day window

## Files to Create

| # | File | Purpose |
|---|------|---------|
| 1 | `inngest/client.ts` | Inngest client instance |
| 2 | `inngest/types.ts` | Event type definitions |
| 3 | `inngest/functions/post-signup.ts` | Post-signup workflow |
| 4 | `inngest/functions/intake-pipeline.ts` | Intake scoring + onboarding |
| 5 | `inngest/functions/document-generation.ts` | Document generation pipeline |
| 6 | `inngest/functions/incident-report.ts` | Incident processing + PII stripping |
| 7 | `inngest/functions/monthly-audit.ts` | Monthly compliance audit cron |
| 8 | `inngest/functions/training-reminders.ts` | Weekly training reminder cron |
| 9 | `inngest/functions/regulatory-scan.ts` | Daily regulatory update scanner |
| 10 | `inngest/functions/payment-failed.ts` | Payment failure escalation |
| 11 | `app/api/inngest/route.ts` | Inngest serve handler |

## Files to Modify

| # | File | Change |
|---|------|--------|
| 12 | `lib/actions/documents.ts` | Fire `compliance/document.requested` event after insert |
| 13 | `lib/actions/incidents.ts` | Fire `compliance/incident.reported` event after insert |

## Implementation Order

### Phase 1: Install + Client Setup (files 1-2)
1. Install `inngest` package
2. Create `inngest/client.ts` with typed client
3. Create `inngest/types.ts` with event definitions

### Phase 2: Core Workflows (files 3-6)
4. `post-signup.ts` — simplest function, 2 steps
5. `intake-pipeline.ts` — 6 steps, scoring + doc generation
6. `incident-report.ts` — PII stripping + severity-based wait
7. `document-generation.ts` — client data gathering + status update

### Phase 3: Cron Jobs (files 7-9)
8. `monthly-audit.ts` — client roster loop + audit inserts
9. `training-reminders.ts` — deadline checking + email stubs
10. `regulatory-scan.ts` — placeholder scanner

### Phase 4: Payment + API Route (files 10-11)
11. `payment-failed.ts` — 3-step escalation with waitForEvent
12. `app/api/inngest/route.ts` — serve handler registering all 8 functions

### Phase 5: Wire Server Actions (files 12-13)
13. Update `lib/actions/documents.ts` to fire `compliance/document.requested` after requestDocument
14. Update `lib/actions/incidents.ts` to fire `compliance/incident.reported` after createIncident

## Environment Variables (Already Provisioned)

```
INNGEST_EVENT_KEY     ✅ in .env.local
INNGEST_SIGNING_KEY   ✅ in .env.local
```

## Acceptance Criteria

- [ ] `npm run build` passes
- [ ] `inngest` package installed
- [ ] Inngest client created with typed events
- [ ] All 8 functions compile and export correctly
- [ ] API route at /api/inngest serves all functions
- [ ] Document request fires `compliance/document.requested` event
- [ ] Incident creation fires `compliance/incident.reported` event
- [ ] PII stripping regex handles names, emails, phones, SSNs
- [ ] Monthly audit cron scheduled for 1st of month
- [ ] Training reminders cron scheduled for every Monday
- [ ] Resend calls are stubbed (log only) — wired in future email stage
- [ ] PDF generation is stubbed — wired in future pdf-lib stage
