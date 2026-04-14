# Multi-Site Consolidated Dashboard — Spec

**Audit gap:** #4 — Multi-Site plan ($1,297/mo) sold "consolidated multi-site
dashboard" and "separate site-specific documentation per location" but the
product has no `sites` table. Every client row treats the business as a
single location.

**Risk:** this touches every data-bearing table (incidents, documents,
training, intake, alerts, audit_log) and every RLS policy that scopes by
`client_id`. Rushing it would break existing single-site clients.
**Recommended:** dedicated 2-session build.

---

## Data model

### New tables

```sql
create table sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  employee_count int,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index idx_sites_primary on sites(client_id) where is_primary;
alter table sites enable row level security;
create policy "sites_select_own" on sites for select using (client_id = auth.uid());
create policy "sites_write_own" on sites for all using (client_id = auth.uid()) with check (client_id = auth.uid());
```

### Column additions (nullable to preserve back-compat)

```sql
alter table incidents        add column if not exists site_id uuid references sites(id);
alter table documents        add column if not exists site_id uuid references sites(id);
alter table training_records add column if not exists site_id uuid references sites(id);
alter table alerts           add column if not exists site_id uuid references sites(id);
alter table employee_log_requests add column if not exists site_id uuid references sites(id);
```

Leave as nullable. Rows without `site_id` are treated as "All sites" /
pre-multi-site. New rows from Multi-Site clients get `site_id` populated
from a `Selected Site` context.

### Backfill

For every client on the `multi-site` plan, create one `sites` row with
`is_primary = true` using the client's existing address. Existing records
stay unassigned.

---

## RLS

All current policies read `client_id = auth.uid()`. Keep them. No per-site
RLS — a client sees all of their own sites. Authorization for
per-site access (when/if roles are introduced) is a follow-up.

---

## UI

### Dashboard layout

1. **Site picker** in the dashboard header (next to user menu). Defaults to
   "All sites". Persist choice in a cookie (`protekon_site_id`).
2. When picker = "All sites", queries return everything the client owns
   (existing behavior).
3. When a specific site is selected, queries filter by `site_id = :selected`.
   Rows with `site_id IS NULL` are shown under "All sites" only.

### New: `/dashboard/sites`

- List of sites with employee count, primary flag, counts of open incidents,
  docs due, training overdue.
- Add/edit/delete site form.
- Tier-gated to `multi-site` plan. Others see an upgrade card.

### New: `/dashboard/rollup` (the audit's "consolidated dashboard")

- Matrix of sites × KPIs (posture score, open incidents, docs due, training %).
- Per-site sparkline of 90-day posture.
- Regulatory updates broken down by how many sites are affected.
- Tier-gated.

### Existing pages — per-site scoping

Every list page reads the selected site cookie and narrows queries:
- `/dashboard/incidents`
- `/dashboard/documents`
- `/dashboard/training`
- `/dashboard/reports/*`
- `/dashboard/incidents/log-requests`

---

## Server actions

Add a helper `getSiteContext()` in `lib/site-context.ts`:

```ts
export async function getSiteContext(): Promise<{ siteId: string | null }> {
  const cookie = (await cookies()).get("protekon_site_id")?.value
  if (!cookie || cookie === "all") return { siteId: null }
  return { siteId: cookie }
}
```

Every list/read action reads this and appends `.eq("site_id", siteId)` when
`siteId` is non-null.

Every write action (create incident, request document, etc.) stamps
`site_id` from context if a site is selected.

---

## Pricing / plan gate

- Plans `core` and `professional`: sites table exists but is empty by
  default. UI hides the site picker and `/dashboard/sites` link.
- Plan `multi-site`: site picker shown, `/dashboard/sites` and
  `/dashboard/rollup` unlocked. Stripe webhook on plan upgrade
  creates the primary site row from the client's address.
- Plan downgrade: sites remain in DB but new writes fall back to
  `site_id = null`. Data is not destroyed.

---

## Inngest impact

- `plan-update-pipeline.ts`: on upgrade to multi-site, enqueue `sites/primary.create` event.
- `monthly-audit.ts`: when rolling up, iterate sites and emit per-site
  posture scores.
- `scheduled-delivery.ts`: document delivery schedules become per-site;
  update the cron logic.

---

## Tests

- Single-site client invariants: existing queries unchanged, site picker
  hidden, all existing UI flows pass unchanged.
- Multi-site client: creating a site filters incidents/docs to that site.
- Backfill idempotency: running the multi-site upgrade twice produces
  exactly one primary site.

---

## Session split

- **Session A (migrations + scope):** 020_sites.sql + column adds,
  `getSiteContext()` helper, cookie plumbing, site picker component, hide
  for non-multi-site plans. Ship without changing any existing page
  behavior (default site = "all").
- **Session B (rollup):** `/dashboard/sites` CRUD, `/dashboard/rollup` KPI
  matrix, wire every list action to `getSiteContext()`, update Stripe
  webhook + Inngest, tests.

Ship Session A behind a feature flag so single-site clients see zero
change until the rollup UI is ready.
