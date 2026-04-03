# ai-officer-repositioning Plan

## Objective
Reposition all copy from "Managed Compliance Service" to "Your AI Compliance Officer" across homepage, pricing, about, samples, signup, dashboard, nav, footer, and Inngest email templates — plus add 2 new homepage sections (How the Agent Works, Before/After).

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Frontend Builder A | builder-homepage | .claude/agents/team/builder.md | Homepage copy + 2 new sections |
| Frontend Builder B | builder-pages | .claude/agents/team/builder.md | Pricing, about, samples, signup |
| Frontend Builder C | builder-global | .claude/agents/team/builder.md | Nav, Footer, dashboard layout/pages |
| Backend Builder | builder-emails | .claude/agents/team/builder.md | Inngest email templates in score-drip + other functions |
| Validator | validator | .claude/agents/team/validator.md | Quality gates |

## Contract
No new types or APIs. This is a copy-only repositioning. All changes are string replacements + 2 new JSX sections on homepage.

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-homepage | app/page.tsx | All other files |
| builder-pages | app/pricing/page.tsx, app/about/page.tsx, app/samples/page.tsx, app/signup/page.tsx | Homepage, dashboard, nav, footer |
| builder-global | components/layout/Nav.tsx, components/layout/Footer.tsx, app/dashboard/layout.tsx, app/dashboard/page.tsx, app/dashboard/intake/page.tsx, app/dashboard/chat/page.tsx | Homepage, marketing pages |
| builder-emails | inngest/functions/score-drip.ts, inngest/functions/post-signup.ts, inngest/functions/scheduled-delivery.ts, inngest/functions/regulatory-scan.ts, inngest/functions/incident-report.ts | All page files |

## Tasks

### Task 1: Homepage — copy + 2 new sections
- **Owner:** builder-homepage
- **Input:** Full copy spec for Page 1 (homepage)
- **Output:** app/page.tsx updated
- **Dependencies:** none
- **Instructions:**
  Read app/page.tsx. Apply ALL copy changes from the spec (hero, product overview, 4 feature cards, comparison table, pricing section, sample report, final CTA). ADD two new sections: "How the Agent Works" (5 daily timeline cards) and "Before/After" (6-row comparison table). Use Edit tool for text swaps, Write only if restructuring needed.

### Task 2: Pricing + About + Samples + Signup
- **Owner:** builder-pages
- **Input:** Copy spec for Pages 2-5
- **Output:** 4 files updated
- **Dependencies:** none
- **Instructions:**
  Read each file, apply all text changes per spec. Pricing: hero, comparison banner, FAQ updates + 2 new FAQs, bottom CTA. About: hero, mission, values card. Samples: hero, comparison section. Signup: left panel headline/subhead/checklist.

### Task 3: Nav + Footer + Dashboard pages
- **Owner:** builder-global
- **Input:** Global changes + dashboard copy spec
- **Output:** 6 files updated
- **Dependencies:** none
- **Instructions:**
  Nav: "MANAGED COMPLIANCE" → "AI COMPLIANCE OFFICER". Footer: tagline + copyright year. Dashboard layout: sidebar tagline. Dashboard page: add welcome message. Intake: update fine exposure warning. Chat: update intro + suggestion chips.

### Task 4: Inngest email templates
- **Owner:** builder-emails
- **Input:** Email template updates from spec
- **Output:** Inngest function files updated
- **Dependencies:** none
- **Instructions:**
  Update email subject lines and opening copy in score-drip.ts and other Inngest functions to use "AI compliance officer" framing per spec. Only update string literals — no structural changes.

### Task 5: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results
- **Dependencies:** Task 1, 2, 3, 4
- **Instructions:**
  Run tsc --noEmit and npm run build. Fix any errors in modified files only.

## Execution Order
1. Task 1 + Task 2 + Task 3 + Task 4 — ALL parallel (no dependencies)
2. Task 5 — depends on all builders

## Validation Criteria
- [ ] All "Managed Compliance" references replaced with "AI Compliance Officer"
- [ ] Homepage has 2 new sections (Agent daily timeline + Before/After)
- [ ] Nav tagline updated globally
- [ ] Footer tagline + copyright year updated
- [ ] All quality gates pass
