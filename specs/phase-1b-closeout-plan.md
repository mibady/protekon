# phase-1b-closeout Plan

## Objective
Close the remaining Phase 1B onboarding-wizard backlog across three independent tracks: fire the `auth/user.signed-up` Inngest event, ship a Playwright E2E spec for the wizard, and configure the 9 Tier-2 verticals.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Backend Builder | builder-events | `.claude/agents/team/builder.md` | Inngest event wiring — sender-side plumbing |
| QA Builder | builder-e2e | `.claude/agents/team/builder.md` | Playwright spec covering construction + healthcare wizard paths |
| Config Builder | builder-configs | `.claude/agents/team/builder.md` | 9 Tier-2 vertical configs + barrel registration |
| Validator | validator | `.claude/agents/team/validator.md` | tsc / lint / vitest / build / playwright gates |
| Fixer | fixer | `.claude/agents/team/fixer.md` | Iterative fixes on validator-reported failures |
| Auditor | auditor | `.claude/agents/team/auditor.md` | Feature audit of `/onboarding/business` with Tier-2 slugs selected |

## Contract
The three tracks share no runtime contract — each owns a disjoint path in the tree and ships on independent commits inside the same feature branch. Common constraints:

- All code must pass the CI workflow shipped in PR #22 (tsc + lint + vitest + build).
- Tier 2 configs **must** follow `lib/onboarding/verticals/mining.ts` as the canonical template and consume terminology/doc-categories from `docs/vertical-architecture-research.md`. Doc-category IDs must match canonical strings in `lib/document-templates.ts` (no invented slugs).
- The Playwright spec uses `e2e/auth.setup.ts` for login bootstrap and follows conventions already established in the 16 existing specs.
- The event sender must use the event shape already declared in `inngest/types.ts` and trigger the existing handler at `inngest/functions/onboarding/post-signup-workflow.ts` (no handler changes).

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-events | `inngest/functions/auth/` (if new), auth webhook/Stripe-post-checkout sender site | `lib/onboarding/`, `e2e/` |
| builder-e2e | `e2e/onboarding-wizard.spec.ts` (new); `playwright.config.ts` **only** if a new project is needed | `inngest/`, `lib/onboarding/verticals/` |
| builder-configs | `lib/onboarding/verticals/{hospitality,agriculture,transportation,auto-services,wholesale,utilities,equipment_repair,laundry,staffing}.ts`, `lib/onboarding/verticals/index.ts` barrel | everything outside `lib/onboarding/verticals/` |

## Tasks

### Task 1: Wire auth/user.signed-up event sender
- **Owner:** builder-events
- **Input:** Existing handler at `inngest/functions/onboarding/post-signup-workflow.ts`; event shape in `inngest/types.ts`; auth flow through Supabase + Stripe webhook entry points.
- **Output:** `inngest.send({ name: 'auth/user.signed-up', data: {...} })` wired at the appropriate auth code path so the existing handler runs on real user creation.
- **Dependencies:** none
- **Instructions:**
  Audit where the event *should* fire — likely the Stripe post-checkout path that creates the Supabase user, or a Supabase auth webhook. Fire the Inngest event with the shape declared in `inngest/types.ts`. Verify end-to-end locally via Inngest dev server; do not modify the handler.

### Task 2: Playwright E2E spec for onboarding wizard
- **Owner:** builder-e2e
- **Input:** `e2e/auth.setup.ts`, existing 16 e2e specs as pattern reference, `scripts/reset-onboarding.ts` for between-run cleanup.
- **Output:** `e2e/onboarding-wizard.spec.ts` with two test cases — construction (all 7 steps visible) and healthcare (Step 5 hidden by `stepVisibility.thirdParties: false`).
- **Dependencies:** none
- **Instructions:**
  Log in as a reset demo account, walk Steps 1→7, assert at the end that `clients.onboarding_status = 'completed'` and `onboarded_at` is stamped, then assert a second login routes straight to `/dashboard`. For healthcare, assert Step 5 (subs) is skipped.

### Task 3: Tier 2 vertical configs (9 slugs)
- **Owner:** builder-configs
- **Input:** `lib/onboarding/verticals/mining.ts` (canonical template), `docs/vertical-architecture-research.md` (terminology + doc categories per vertical), `lib/document-templates.ts` (canonical doc-category IDs).
- **Output:** 9 new vertical config files + barrel update registering all nine in the REGISTRY and exporting them.
- **Dependencies:** none
- **Instructions:**
  For each Tier-2 slug — hospitality, agriculture, transportation, auto-services, wholesale, utilities, equipment_repair, laundry, staffing — create `lib/onboarding/verticals/<slug>.ts` following the mining.ts pattern. One commit per vertical. Prefer existing template IDs over inventing new ones; if a slug clearly needs a template that doesn't exist (e.g., `pesticide-safety` for agriculture), use what's available and leave a note in the file's header comment.

### Task 4: Validate
- **Owner:** validator
- **Input:** All builder outputs from Tasks 1–3 on a single feature branch.
- **Output:** Quality-gate report. Failures route to Fixer.
- **Dependencies:** Task 1, Task 2, Task 3
- **Instructions:**
  Run `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npx next build`, and `npx playwright test e2e/onboarding-wizard.spec.ts`. Baseline test failures (55 pre-existing on main) are acceptable; new failures are not. Report any regressions for Fixer.

### Task 5: Audit
- **Owner:** auditor
- **Input:** Validated codebase.
- **Output:** Functional-rate report covering `/onboarding/business` with 3 randomly-chosen Tier-2 slugs selected.
- **Dependencies:** Task 4
- **Instructions:**
  For 3 of the 9 new Tier-2 slugs, load `/onboarding/business`, select that slug from the dropdown, advance to Step 2 and confirm the new terminology surfaces in microcopy, then advance to Step 6 and confirm the `requiredDocCategories` list reflects the config. Target ≥95% functional.

## Execution Order
1. Task 1 + Task 2 + Task 3 — **parallel** (no shared files, no shared contract)
2. Task 4 (Validate) — depends on Tasks 1, 2, 3
3. Task 5 (Audit) — depends on Task 4

## References Consulted
- `lib/onboarding/verticals/mining.ts`, `waste_environmental.ts` (canonical template)
- `lib/onboarding/verticals/types.ts`, `default.ts`, `index.ts` (registry shape)
- `lib/document-templates.ts` (canonical doc-category IDs)
- `inngest/functions/onboarding/post-signup-workflow.ts`, `inngest/types.ts`
- `e2e/auth.setup.ts`, `playwright.config.ts`
- `scripts/reset-onboarding.ts` (E2E between-run cleanup)
- `docs/vertical-architecture-research.md`
- `CLAUDE.md` (Protekon project)
- Memory: `project_vertical_config_rollout.md`, `project_session_33_phase_1b_hardening.md`

## Validation Criteria
Codeable (agent-owned):
- [ ] `auth/user.signed-up` fires on real user creation; existing handler completes without error
- [ ] `e2e/onboarding-wizard.spec.ts` passes for both the construction and healthcare paths
- [ ] 9 Tier-2 configs exist, register in the barrel, and resolve via `getOnboardingConfig(slug)`
- [ ] tsc clean, lint clean, build green, CI workflow passes on PR
- [ ] Auditor feature-audit ≥ 95% functional on `/onboarding/business` for 3 randomly-sampled Tier-2 slugs
- [ ] `MEMORY.md` + `project_vertical_config_rollout.md` updated to `14/26 configured` post-merge

Human-gated (out of agent scope; listed so the full backlog is tracked):
- [ ] PR #23 (seed-demo-v2 + handoff spec) merge decision — user reviews
- [ ] Live paid-signup smoke test on prod wizard — requires real Stripe card; user executes
- [ ] Scraper service-role key rotation (`vizmtkfpxxjzlpzibate`) — Supabase dashboard + Vercel env; user executes
