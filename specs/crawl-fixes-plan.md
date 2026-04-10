# crawl-fixes Plan

## Objective

Fix all broken pages, dead links, and API issues discovered by the Meticulous full-site crawl — 2 missing dashboard pages, 3 missing industry slugs, Sanity-powered resources/[slug], middleware /partners bug, and 3 API route fixes.

## Team Members

| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Backend Builder | builder-api | .claude/agents/team/builder.md | Middleware fix, API route fixes, upload error handling |
| Frontend Builder | builder-ui | .claude/agents/team/builder.md | Missing pages, industry slugs, resources/[slug] |
| Validator | validator | .claude/agents/team/validator.md | Quality gates |
| Auditor | auditor | .claude/agents/team/auditor.md | Verify all 65 routes load |

## Contract

```typescript
// No new types needed — all changes use existing patterns

// Dashboard pages follow existing pattern:
// "use client" + framer-motion + server actions + loading/empty states

// Resources [slug] uses existing Sanity queries:
// resourceBySlugQuery from lib/sanity/queries.ts
// PortableText renderer from lib/sanity/portable-text.tsx

// Industry slug data shape (existing):
interface IndustryData {
  label: string
  description: string
  riskLevel: string
  enforcement: string
  topStandards: { code: string; name: string; risk: string }[]
  documents: string[]
  painPoints: string[]
  tierRecommendation: string
  tierPrice: string
}
```

## File Ownership

| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-api | `lib/supabase/middleware.ts`, `app/api/upload/route.ts`, `app/api/documents/download/route.ts`, `app/api/admin/partners/route.ts` | components/, app/(pages)/ |
| builder-ui | `app/dashboard/billing/`, `app/dashboard/team/`, `app/industries/[slug]/page.tsx`, `app/industries/page.tsx`, `app/resources/[slug]/page.tsx` | app/api/, lib/supabase/ |

## Tasks

### Task 1: Fix middleware and API routes
- **Owner:** builder-api
- **Input:** Current files (already read into context above)
- **Output:** 4 fixed files
- **Dependencies:** none
- **Instructions:**

  **A. `lib/supabase/middleware.ts` (lines 37-46)** — Already done locally. The fix:
  - Add `meticulous-is-test` header check to skip redirect only (not session refresh)
  - Change `startsWith("/partner")` to `=== "/partner" || startsWith("/partner/")` so `/partners/*` public routes aren't caught

  **B. `app/api/documents/download/route.ts`** — Move auth check BEFORE param validation:
  ```
  Line 4: Create supabase client
  Line 5: Check auth (401 if no user)
  Line 6: THEN check documentId param (400 if missing)
  ```

  **C. `app/api/admin/partners/route.ts` (line 11)** — Change status 403 to 401:
  ```typescript
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  ```
  The 403 is for "you're authenticated but not admin". But `verifyAdmin()` returns null for both unauthenticated AND non-admin users, so 401 is more correct for the "not logged in" case.

  **D. `app/api/upload/route.ts`** — Wrap `put()` call in try/catch to return 500 with message instead of unhandled crash (likely fails when `BLOB_READ_WRITE_TOKEN` is missing):
  ```typescript
  try {
    const blob = await put(...)
    return NextResponse.json({ url: blob.url, filename: file.name })
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
  ```

### Task 2: Build missing pages and fix broken links
- **Owner:** builder-ui
- **Input:** Design tokens (void/crimson/gold/parchment palette), existing dashboard page pattern from `app/dashboard/documents/page.tsx`
- **Output:** 5 new/updated files
- **Dependencies:** none (parallel with Task 1)
- **Instructions:**

  **A. `app/dashboard/billing/page.tsx`** — Create billing management page:
  - "use client" with framer-motion animations matching other dashboard pages
  - Show current plan tier, next billing date, payment method (all placeholder data for now — will wire to Stripe in DNA phase)
  - "Manage Subscription" and "Update Payment" buttons that link to Stripe portal (`/api/stripe/portal`)
  - Invoice history table (empty state: "No invoices yet")
  - Use existing design tokens: bg-void, text-parchment, border-brand-white/10, accent crimson/gold

  **B. `app/dashboard/team/page.tsx`** — Create team management page:
  - "use client" with framer-motion
  - Team member list with role badges (Owner, Admin, Viewer)
  - "Invite Member" button (disabled state with "Coming soon" tooltip — multi-user is a future feature)
  - Current user shown as Owner
  - Use same card pattern as documents page

  **C. `app/industries/[slug]/page.tsx`** — Add 3 missing industry entries to the `industries` Record:
  - `"real-estate"`: Property management, lead paint, habitability, tenant safety. Tier: Professional $897/mo
  - `"logistics"`: Warehousing, distribution, forklift safety, ergonomics. Tier: Professional $897/mo
  - `"auto-services"`: Dealerships, repair shops, hazmat handling, spray booth safety. Tier: Core $597/mo
  - Each needs: topStandards (3-4 Cal/OSHA codes), documents (3-4 compliance docs), painPoints (3-4 items)

  **D. `app/industries/page.tsx`** — Sync the index page. The current page lists 8 industries but the [slug] page has 11 (including agriculture, wholesale, transportation). Add the missing 3 to the index page with appropriate Phosphor icons.

  **E. `app/resources/[slug]/page.tsx`** — Create Sanity-powered resource detail page:
  - Server component (no "use client") — fetch from Sanity using `resourceBySlugQuery`
  - Render body with `PortableText` from `lib/sanity/portable-text.tsx`
  - Show title, publishedAt, categories, cover image
  - Back link to `/resources`
  - Use `notFound()` if slug not found
  - Import Sanity client from `lib/sanity/client.ts`

### Task 3: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results (tsc, lint, build)
- **Dependencies:** Task 1, Task 2
- **Instructions:**
  Run quality gates: `tsc --noEmit`, `eslint .`, `npm run build`. Report failures for Fixer.

### Task 4: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Route verification report
- **Dependencies:** Task 3
- **Instructions:**
  Re-run `npx tsx scripts/meticulous-crawl.ts` against new deployment. Verify:
  - All 65+ routes return 200 (no AUTH-REDIRECT on `/partners/*`)
  - `/dashboard/billing` and `/dashboard/team` render content
  - `/industries/real-estate`, `/industries/logistics`, `/industries/auto-services` render
  - No broken links in extracted href report

## Execution Order

1. Task 1 (builder-api) + Task 2 (builder-ui) — **parallel**, no dependencies
2. Task 3 (validator) — depends on Task 1 + Task 2
3. Task 4 (auditor) — depends on Task 3

## References Consulted

- `app/dashboard/documents/page.tsx` — dashboard page pattern (client component + framer-motion + actions)
- `app/industries/[slug]/page.tsx` — industry data shape and page structure
- `app/industries/page.tsx` — index page linking pattern
- `lib/sanity/queries.ts` — `resourceBySlugQuery` for resources/[slug]
- `lib/sanity/portable-text.tsx` — PortableText renderer
- `lib/sanity/client.ts` — Sanity client (public + preview)
- `lib/supabase/middleware.ts` — auth redirect logic
- `app/api/upload/route.ts`, `app/api/documents/download/route.ts`, `app/api/admin/partners/route.ts` — API routes to fix
- `tailwind.config.ts` — design tokens (void, crimson, gold, parchment, ash, steel, fog)

## Validation Criteria

- [ ] All 65+ routes return 200 (no 404s, no AUTH-REDIRECTs on public pages)
- [ ] `/dashboard/billing` renders with plan tier and Stripe portal link
- [ ] `/dashboard/team` renders with current user as Owner
- [ ] `/industries/real-estate`, `/industries/logistics`, `/industries/auto-services` render full pages
- [ ] `/industries` index links to all 11 industries
- [ ] `/resources/[slug]` renders Sanity content with PortableText
- [ ] `/partners/*` marketing pages accessible without auth
- [ ] `/api/documents/download` returns 401 before 400
- [ ] `/api/admin/partners` returns 401 for unauthenticated
- [ ] `/api/upload` returns 500 with message instead of crash
- [ ] All quality gates pass (tsc, lint, build)
