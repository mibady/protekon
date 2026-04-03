# Review Fixes Implementation Spec

## Overview
Fix all issues found during code review of the production-polish build. Ranges from race condition fixes to wiring a decorative filter dropdown.

## Layers
- [x] Backend: yes (server actions, API routes)
- [x] Frontend: yes (regulations filter)
- [ ] Database: no
- [ ] AI: no

## Fixes

### Fix 1: Incident ID race condition (HIGH)
**File:** `lib/actions/incidents.ts` lines 27-35
**Problem:** Count-then-increment is not atomic. Two concurrent requests get same sequence number.
**Fix:** Use `INSERT ... RETURNING` with a database-generated sequence, or use a retry loop with unique constraint. Simplest: use crypto.randomUUID() suffix instead of sequential numbering, OR add a unique constraint on incident_id and retry on conflict.
**Approach:** Change to `INC-YYYY-XXXXX` where XXXXX is a random 5-char alphanumeric. This eliminates the race entirely while keeping IDs human-readable. Add a retry loop (max 3) in case of the astronomically unlikely collision.

### Fix 2: Alerts error propagation (MEDIUM)
**File:** `lib/actions/alerts.ts` line 55
**Problem:** `getAlerts()` returns `[]` on DB error, masking failures.
**Fix:** Throw or return `{ data: [], error: string }`. Since this is a server action consumed by a client component, return an object with optional error field.

### Fix 3: Regulations severity filter (MEDIUM)
**File:** `app/dashboard/regulations/page.tsx` lines 46-55
**Problem:** Filter dropdown has no onChange handler.
**Fix:** Add state for selected severity, wire onChange, filter the `updates` array.

### Fix 4: Server-side error logging in export routes (MEDIUM)
**Files:** `app/api/export/incidents/route.ts`, `app/api/export/report/route.ts`
**Problem:** Errors only returned to client, not logged server-side.
**Fix:** Add `console.error` before returning error responses. Wrap main logic in try/catch for unexpected errors.

### Fix 5: Audit log error checking (LOW)
**File:** `lib/actions/incidents.ts` lines 62, 153
**Problem:** Audit log inserts don't check for errors.
**Fix:** Check error return and log (don't fail the main operation, but log the failure).

## Implementation Order
1. Fix 1 — incidents race condition
2. Fix 2 — alerts error propagation  
3. Fix 3 — regulations filter
4. Fix 4 — export route logging
5. Fix 5 — audit log checking

## Acceptance Criteria
- [ ] Incident IDs are collision-safe under concurrent requests
- [ ] getAlerts() propagates DB errors to caller
- [ ] Regulations severity filter filters the list
- [ ] Export route errors logged server-side
- [ ] Audit log failures logged (not swallowed)
- [ ] All quality gates still pass (tsc, lint, tests, build)
