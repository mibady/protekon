# multi-site-polish Plan

## Objective
Ship the three Session B polish pieces — sites CRUD, header site picker, and per-site stamping in create actions — so Multi-Site clients can self-serve locations, filter every list page per site, and have new records auto-tagged without manual assignment.

## Scope Boundary
No schema changes. The `sites` table, `site_id` nullable FKs on incidents/documents/training_records/alerts/employee_log_requests, `get_site_rollup`, `provision_primary_site`, `backfill_primary_sites`, and `assign_records_to_site` are already live in Supabase (verified Session 26). This plan is UI + action plumbing only.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Backend Builder | builder-api | .claude/agents/team/builder.md | sites CRUD actions, `getSiteContext()`, per-site stamping in create actions |
| Frontend Builder | builder-ui | .claude/agents/team/builder.md | `/dashboard/sites` CRUD page + `SitePicker` header component |
| Validator | validator | .claude/agents/team/validator.md | tsc + lint + build quality gates |
| Auditor | auditor | .claude/agents/team/auditor.md | UI verification: CRUD flow, picker cookie behavior, new-record stamping |

## Contract

```ts
// lib/types.ts (or inline in sites.ts)
export type Site = {
  id: string
  client_id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  employee_count: number | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

// lib/site-context.ts — cookie reader used by every list + create action
export async function getSiteContext(): Promise<{ siteId: string | null }>

// cookie
COOKIE_NAME = "protekon_site_id"     // value: "all" or uuid
```

**Actions to stamp** (add `site_id` from context on insert when siteId !== null):
- `lib/actions/incidents.ts` → `reportIncident`
- `lib/actions/documents.ts` → `requestDocument`
- `lib/actions/training.ts` → `addTrainingRecord`
- `lib/actions/employee-log-requests.ts` → `createEmployeeLogRequest`
- `lib/actions/alerts.ts` → any insert (if creatable from UI)

**Sites CRUD action surface** (`lib/actions/sites.ts`):
- `listSites(): Promise<Site[]>`
- `createSite(formData): Promise<{success,id}|{error}>` — enforces plan tier + location cap
- `updateSite(id, formData): Promise<ActionResult>`
- `deleteSite(id): Promise<ActionResult>` — blocks delete of primary; reassigns records via `assign_records_to_site(clientId, null)` before delete
- `setPrimarySite(id): Promise<ActionResult>` — transaction unsets previous primary
- `selectSite(id|"all"): Promise<void>` — writes cookie (server action)

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-api | `lib/actions/sites.ts`, `lib/site-context.ts`, additive edits to `lib/actions/{incidents,documents,training,employee-log-requests,alerts}.ts` (stamp site_id only) | components/, app/dashboard/** pages |
| builder-ui | `app/dashboard/sites/page.tsx`, `app/dashboard/sites/[id]/edit/page.tsx`, `components/dashboard/SitePicker.tsx`, single edit to `app/dashboard/layout.tsx` to mount SitePicker in header | lib/actions/**, supabase/** |

## Tasks

### Task 1: Backend — `getSiteContext()` + sites CRUD actions
- **Owner:** builder-api
- **Input:** Contract above; existing sites table + RLS (auth.uid() scoped)
- **Output:** `lib/site-context.ts` + `lib/actions/sites.ts` with the 6 exports listed
- **Dependencies:** none
- **Instructions:**
  Read cookie via `next/headers`; fallback to `null` (= "all sites"). `createSite` must check `clients.plan === "multi-site"` and enforce the tier's location cap (Multi-Site = 3). `deleteSite` calls the existing `assign_records_to_site(clientId, null)` RPC to detach records before removing the row, and refuses to delete the primary. `setPrimarySite` runs `update sites set is_primary = false where client_id = :uid; update sites set is_primary = true where id = :id` in a single round trip via `.rpc` or a pair of awaited calls guarded by a unique partial index that already exists. `selectSite` writes the cookie with `httpOnly: false, sameSite: "lax", path: "/"` so client components can read it if needed.

### Task 2: Backend — per-site stamping in create actions
- **Owner:** builder-api
- **Input:** `getSiteContext()` from Task 1; list of 5 create actions above
- **Output:** Each targeted insert now includes `site_id: (await getSiteContext()).siteId` in the insert payload. No behavior change when siteId is null.
- **Dependencies:** Task 1
- **Instructions:**
  For each action, read the context once at the top, spread `site_id` into the insert object. Do not change validation, return types, or error paths. For Inngest events that carry incident/log data downstream, include `siteId` in the event payload so future workflows can honor scoping.

### Task 3: Frontend — SitePicker header component
- **Owner:** builder-ui
- **Input:** Task 1 actions (`listSites`, `selectSite`); cookie name from contract
- **Output:** `components/dashboard/SitePicker.tsx` + one-line mount in `app/dashboard/layout.tsx` header (next to user menu). Hidden for non-multi-site plans.
- **Dependencies:** Task 1
- **Instructions:**
  Client component with Suspense boundary. Fetches sites on mount; dropdown shows "All sites" + each site (primary badged). Selecting an item calls `selectSite(id)` server action and `router.refresh()` so every server component on the page re-queries. If there are 0 or 1 sites, render as disabled label rather than a dropdown.

### Task 4: Frontend — `/dashboard/sites` CRUD page
- **Owner:** builder-ui
- **Input:** Task 1 actions
- **Output:** Tier-gated list + form UI: table of sites (name, address, employee count, primary badge), "Add site" inline form, per-row edit/delete/set-primary buttons
- **Dependencies:** Task 1
- **Instructions:**
  Mirror patterns from `/dashboard/training` (inline form, table, mobile card view). Show upgrade card for non-Multi-Site tiers. Show `site_unassigned` count banner with "Bulk assign unassigned records to…" action using `assign_records_to_site` RPC. Delete confirms via `window.confirm` with record count warning.

### Task 5: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results
- **Dependencies:** Task 1, Task 2, Task 3, Task 4
- **Instructions:**
  Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Report any failures to Fixer. Do not run the existing flaky test suite (19 preexisting failures per Session 24 log).

### Task 6: Audit
- **Owner:** auditor
- **Input:** Validated codebase on preview deploy
- **Output:** Functional rate report
- **Dependencies:** Task 5
- **Instructions:**
  As a Multi-Site client: create a second site from `/dashboard/sites`; verify picker shows both; switch picker to the new site; create an incident and confirm the row has `site_id` populated matching the picker; switch picker back to "all" and confirm both sites' records appear; attempt to delete the primary site and verify refusal. As a Core-tier client: `/dashboard/sites` shows upgrade card, picker is hidden, existing flows unchanged. Target ≥95% functional.

## Execution Order
1. Task 1 — Backend context + sites CRUD (sequential)
2. Task 2, Task 3, Task 4 (parallel — all depend only on Task 1)
3. Task 5 — Validate (depends on 2, 3, 4)
4. Task 6 — Audit (depends on 5)

## References Consulted
- `specs/multi-site-rollup.md` (Session B scope)
- `memory/project_audit_scoreboard.md` (data-layer verification from Session 26)
- `lib/actions/documents.ts`, `lib/actions/settings.ts` (existing vertical/plan gating pattern)
- `app/dashboard/training/page.tsx` (CRUD UI pattern)

## Validation Criteria
- [ ] Multi-Site client can add/edit/delete a site from `/dashboard/sites`
- [ ] Deleting the primary site is refused
- [ ] `set_primary` leaves exactly one `is_primary = true` row per client
- [ ] Site picker appears for Multi-Site clients and is hidden for Core/Professional
- [ ] Selecting a site filters every list page (incidents, documents, training, log-requests, alerts) to that site; "All sites" reverts
- [ ] New incidents/documents/training/log-requests created while a site is selected have `site_id` populated on insert
- [ ] New records created with picker on "All sites" leave `site_id = null` (unchanged legacy behavior)
- [ ] Core/Professional clients see zero behavioral change
- [ ] `npx tsc --noEmit`, lint, and `npm run build` pass
- [ ] Feature audit ≥95% functional
