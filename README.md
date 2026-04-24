# Protekon Onboarding — UI Redesign Workspace

A stripped-down copy of the Protekon repo containing **only** the 7-step
onboarding wizard. This branch (`feat/onboarding-ui-only`) is imported into
[v0](https://v0.app) for UI redesign work. Do **not** merge this branch into
`main` — see "Merging changes back" below.

## What's here

```
app/
  layout.tsx          Minimal root layout (fonts + Toaster only)
  globals.css         Brand tokens (void / midnight / crimson / gold / …)
  page.tsx            Redirects /  →  /onboarding
  onboarding/         7 step pages + layout (the whole point of this branch)

components/
  onboarding/         WizardLayout, ProgressRail, 7 step forms
  ui/                 12 shadcn primitives actually used by the wizard

lib/
  onboarding/         26 vertical configs + integration providers
  types/onboarding.ts Contract types (ActionResult envelopes, etc.)
  actions/onboarding/ STUBBED server actions — all return success with mock data
  supabase/server.ts  STUBBED supabase client — fake user, empty rows
  utils.ts            shadcn cn() helper
```

No Supabase, Inngest, Stripe, Resend, Sentry, Sanity, or Blob storage. No
marketing pages, no dashboard, no /score tree. Dev server runs with zero
env vars.

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → it redirects to `/onboarding` → which loads
Step 1 (Business Snapshot). Every form submits to a stub that returns a
canned success response, so you can click through all 7 steps end-to-end.

## Merging changes back to `main`

This branch is **not mergeable to main** — it's missing half the repo.
Instead, cherry-pick the redesigned UI files:

```bash
git checkout main
git pull --ff-only
git checkout -b feat/onboarding-redesign-import
git checkout feat/onboarding-ui-only -- \
  app/onboarding \
  components/onboarding \
  lib/onboarding \
  lib/types/onboarding.ts
# optional — only if shadcn primitives were customised
# git checkout feat/onboarding-ui-only -- components/ui

git commit -m "feat(onboarding): import v0 UI redesign"
git push -u origin feat/onboarding-redesign-import
gh pr create --base main
```

Only the redesigned UI flows back. The stubs stay on the v0 branch; real
server actions and Supabase client stay on `main`.

## What to redesign

Work freely inside:

- `components/onboarding/**` — all 7 step forms + wizard shell + progress
  rail + dashboard preview
- `app/onboarding/**` — page shells (but most live in the form components)
- `app/globals.css` — brand tokens if you want to shift the palette

**Do not touch:**
- `lib/actions/onboarding/*` — stubs; redesigning UI doesn't need this
- `lib/supabase/server.ts` — stub
- `lib/onboarding/verticals/*` — pure config data, shared with `main`

Changing form behavior (new fields, new steps, reordering) is fine and will
flow back cleanly. Changing the `ActionResult<T>` shape of a server action
is **not** fine — `main` still expects the original signatures.
