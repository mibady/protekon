# protekon-dashboard-v3-wave-3 Plan — UI-only surface ports (6 surfaces)

## Objective
Port 6 Remix surfaces whose backend is already fully shipped. Pure UI work: replace UnderConstruction stubs with real surfaces wired to existing server actions.

## Surfaces in scope
| Surface | Remix JSX source | Backend (shipped) | Route |
|---|---|---|---|
| Documents | `docs-cal.jsx:2` | `lib/actions/documents.ts` — requestDocument, getDocuments, getAvailableDocTypesForUser | `app/dashboard/documents/page.tsx` |
| Calendar | `docs-cal.jsx:144` | `lib/actions/calendar.ts` — getCalendarEvents | `app/dashboard/calendar/page.tsx` |
| Activity | `knowledge-activity.jsx:134` | `lib/actions/audit-trail.ts` (from W1) — listAuditLog + `alerts.ts` getAlerts | `app/dashboard/activity/page.tsx` |
| My Business Settings | `my-business.jsx:42` (6 tabs) | `lib/actions/settings.ts` + `lib/actions/sites.ts` + `lib/actions/alerts.ts` | `app/dashboard/my-business/page.tsx` |
| Scheduled Reports | `phase5.jsx:283` | `lib/actions/scheduled-deliveries.ts` | `app/dashboard/scheduled-reports/page.tsx` |
| Knowledge Base | `knowledge-activity.jsx:2` | `lib/actions/knowledge.ts` | `app/dashboard/knowledge/page.tsx` |

## Out of scope
- Training log (no `lib/actions/training.ts` shipped; only `/api/training/signoff/[id]` exists for download)
- Whats Happening / Reg Changes / Benchmarks / Rulemaking — need dedicated Intelligence wave
- Subs cluster — Wave 5 (COI/vendor/sub/1099/safety/projects)
- Team — requires RBAC migration
- Integrations — OAuth cards, Wave 6

## Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead | lead | Orchestrate |
| Frontend Builder | builder-ui | All 6 UI ports |
| Validator | validator | tsc + lint + build |
| Fixer | fixer | Contingent |
| Auditor | auditor | Static check |

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-ui | `app/dashboard/{documents,calendar,activity,my-business,scheduled-reports,knowledge}/page.tsx` (rewrite UnderConstruction stubs), `components/v2/{docs,activity,settings,scheduled,knowledge}/**` (new) | everything else |

**Hard exclusions:** `lib/actions/*` (read-only), `supabase/`, `inngest/`, `app/api/`, `components/v2/primitives/{PageHeader,Card,PriorityPill,CTAButton,ScoreRing,SectionLabel}.tsx` (reuse), `components/v2/dashboard/**` (W2), `components/v2/incidents/**` + `acks/**` (W1), `lib/v2/coverage-resources/*`.

## Tasks

### W3-T1: Frontend — port 6 UI-only surfaces
- **Owner:** builder-ui
- **Input:** Remix JSX source + shipped actions
- **Output:** 6 rewritten page.tsx + new component subfolders as needed
- **Dependencies:** none
- **Instructions:** See per-surface sections below.

### Per-surface scope

**Documents** (`docs-cal.jsx:2`)
- Replace UnderConstruction in `app/dashboard/documents/page.tsx`
- Server component, fetches `getDocuments()` and renders PageHeader + Card + table (Name / Category / Status / Expiration pill / Actions)
- "Request document" CTAButton → modal calling `requestDocument(FormData)` (client wrapper)
- Status pills: `PriorityPill tone="enforcement"` for expired/missing, `"sand"` for review due, `"steel"` for current

**Calendar** (`docs-cal.jsx:144`)
- Replace UnderConstruction in `app/dashboard/calendar/page.tsx`
- Server component fetches `getCalendarEvents()` → renders PageHeader + Card + month grid or list
- Match Remix visual: events grouped by type with tone pills

**Activity** (`knowledge-activity.jsx:134`)
- Replace UnderConstruction in `app/dashboard/activity/page.tsx`
- Server component using `listAuditLog()` from Wave 1's `lib/actions/audit-trail.ts` + `getAlerts()` from `alerts.ts`
- PageHeader + Card + timeline of events (Actor / Event / When)

**My Business Settings** (`my-business.jsx:42` — 6 tabs)
- Replace UnderConstruction in `app/dashboard/my-business/page.tsx`
- Server component at root, client `SettingsPageClient` for tab state
- 6 tab components under `components/v2/settings/`:
  - `ProfileTab.tsx` — `getClientProfile()` + `updateProfile`
  - `SitesTab.tsx` — `listSites` + `createSite`/`updateSite`/`deleteSite`/`setPrimarySite`
  - `BillingTab.tsx` — placeholder for Stripe customer portal link (use existing `/api/stripe/portal` route) + TODO for plan details
  - `NotificationsTab.tsx` — `getNotificationPreferences` + `updateNotificationPreferences`
  - `SecurityTab.tsx` — `changePassword` + placeholders for MFA/sessions (TODO)
  - `DataTab.tsx` — placeholders for export + deletion request (TODO)

**Scheduled Reports** (`phase5.jsx:283`)
- Replace UnderConstruction in `app/dashboard/scheduled-reports/page.tsx`
- Grep `lib/actions/scheduled-deliveries.ts` exports first to match available functions
- PageHeader + Card + table of scheduled deliveries (Cadence / Report Type / Recipients / Next run / Actions)
- "New schedule" client modal calling the appropriate create function

**Knowledge Base** (`knowledge-activity.jsx:2`)
- Replace UnderConstruction in `app/dashboard/knowledge/page.tsx`
- Grep `lib/actions/knowledge.ts` exports first
- PageHeader + Card + article list with search input (for Wave 3, simple `<input>` filter; server-side FTS is later)

### Shared requirements
- Every page uses `PageHeader` + `Card` + `PriorityPill` + `CTAButton` primitives from `components/v2/primitives/`
- Brand tokens: replace Remix `var(--crimson)` → `var(--enforcement)`, `var(--gold)` → `var(--sand)`
- Phosphor icons from `@phosphor-icons/react/dist/ssr` for server components
- Client components only when needed (modals, tab state, form interactions)
- Match Remix visual structure; preserve section hierarchy

### W3-T2: Validate
- **Owner:** validator
- **Dependencies:** W3-T1
- **Instructions:** tsc, lint, build. Verify no UnderConstruction on the 6 target surfaces; Wave 1+2 deliverables untouched; action files + supabase + inngest + api routes all zero diff.

### W3-T3: Fix (contingent)
- **Owner:** fixer
- **Dependencies:** W3-T2 (on failure)

### W3-T4: Audit — static sweep
- **Owner:** auditor
- **Dependencies:** W3-T2 (+T3)
- **Instructions:** 6/6 surfaces no longer render UnderConstruction; all import from shipped actions; Sidebar unchanged.

## Execution Order
```
W3-T1 (Frontend: 6 surface ports — one builder, sequential per surface)
  │
  ▼
W3-T2 (Validate)
  │
  ├─▶ W3-T3 (Fix, contingent)
  ▼
W3-T4 (Audit)
```

## Validation Criteria
- [ ] 6 UnderConstruction stubs replaced with real surfaces
- [ ] All pages import from shipped lib/actions/* (no new action files)
- [ ] pnpm tsc --noEmit passes
- [ ] pnpm lint passes
- [ ] pnpm build passes
- [ ] Wave 1 + Wave 2 files untouched (git diff empty for those paths)
- [ ] No new migrations, no API routes created
- [ ] All 6 surfaces use the v3 primitives

## Handoff
Ready for: `/build "specs/protekon-dashboard-v3-wave-3-plan.md"`
