# copy-guide-rewrite Plan

## Objective
Apply the Protekon Copy Guide across all customer-facing pages — kill "AI" as actor, remove data moat leaks, reframe lead magnets, hide effort counts, and enforce consequence-before-solution pattern.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Builder A | builder-marketing | .claude/agents/team/builder.md | Homepage sections + marketing components |
| Builder B | builder-score | .claude/agents/team/builder.md | Score pages (california, national, landing, wizard) |
| Builder C | builder-pages | .claude/agents/team/builder.md | Pricing, solutions, calculator, about, samples, partners, dashboard |
| Validator | validator | .claude/agents/team/validator.md | Quality gates (tsc, lint, build) |
| Auditor | auditor | .claude/agents/team/auditor.md | Copy audit — verify zero violations remain |

## Contract

### Copy Rules (all builders must follow)
1. **"AI" → "PROTEKON"** in all customer-facing text. Exception: "AI COMPLIANCE OFFICER" sub-wordmark in sidebar stays.
2. **Data moat numbers → generic authority phrases.** "73,960" / "431,000" / "435,000" → "real enforcement data" or "the same data inspectors use."
3. **"No email required" → desire framing.** "Get your personalized scorecard" / "Delivered to your inbox."
4. **Step/question counts → speed framing.** "11 questions" → "a quick assessment" / "about two minutes."
5. **Consequence before solution** in hero/CTA sections.

### Replacement Table
| Kill | Replace With |
|------|-------------|
| "Your AI compliance officer" | "PROTEKON" or "Your compliance officer" |
| "AI-powered compliance engine" | "PROTEKON" |
| "AI agent" | "PROTEKON" |
| "Activate Your AI Compliance Officer" | "Activate Your Compliance Officer" |
| "73,960 Cal/OSHA citations" | "real Cal/OSHA enforcement data" |
| "431,000+ enforcement records" | "real OSHA enforcement data" |
| "435,000+ real enforcement records" | "real enforcement data" |
| "Scraped. Analyzed." | "Monitored. Analyzed. Translated." |
| "No email required" | "Your scorecard in minutes" |
| "No email wall" | (remove entirely) |
| "Answer 11 questions" | "Take a quick assessment" |
| "11 baseline questions" | "A few straightforward questions" |
| "2 minutes. 11 questions." | "About two minutes. Real results." |
| "classified by our AI system" | "classified by PROTEKON" |
| "AI-powered classification" | "automated classification" |
| "You answer 6 questions" | "A few questions about your business" |

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-marketing | components/sections/Hero.tsx, FinalCTA.tsx, Pricing.tsx, Comparison.tsx, SampleReportCTA.tsx, ProductOverview.tsx, BeforeAfter.tsx, DailyTimeline.tsx, DataSection.tsx | app/, lib/ |
| builder-score | app/score/page.tsx, app/score/score-landing.tsx, app/score/california/page.tsx, app/score/california/layout.tsx, app/score/national/page.tsx, app/score/national/layout.tsx, components/score/ScoreWizard.tsx | components/sections/ |
| builder-pages | app/pricing/page.tsx, app/solutions/page.tsx, app/calculator/page.tsx, app/about/page.tsx, app/samples/page.tsx, app/partners/page.tsx, app/dashboard/incidents/new/page.tsx, app/dashboard/incidents/page.tsx, app/dashboard/intake/page.tsx | components/sections/, app/score/ |
| validator | (reads all) | (writes none) |
| auditor | (reads all) | (writes none) |

## Tasks

### Task 1: Marketing Components Copy Rewrite
- **Owner:** builder-marketing
- **Input:** Copy Guide replacement table + file list above
- **Output:** 9 component files with all Rule 1, Rule 2, Rule 5 violations fixed
- **Dependencies:** none
- **Instructions:**
  Edit Hero.tsx, FinalCTA.tsx, Pricing.tsx, Comparison.tsx, SampleReportCTA.tsx, ProductOverview.tsx, BeforeAfter.tsx, DailyTimeline.tsx, DataSection.tsx. Replace every "AI compliance officer" with "PROTEKON" or "your compliance officer." Remove "73,960" and "431,000" stat counts — replace with "real enforcement data." Remove "Scraped. Analyzed." Ensure consequence appears before solution in hero sections. Use Edit tool only — no structural changes, copy only.

### Task 2: Score Pages Copy Rewrite
- **Owner:** builder-score
- **Input:** Copy Guide replacement table + file list above
- **Output:** 7 files with all Rule 1-4 violations fixed
- **Dependencies:** none
- **Instructions:**
  Edit score/page.tsx, score-landing.tsx, score/california/page.tsx + layout.tsx, score/national/page.tsx + layout.tsx, ScoreWizard.tsx. Remove all "No email required" / "No email wall" / "anonymously" language — replace with desire framing ("Your scorecard in minutes", "Get your personalized gap analysis"). Remove all "11 questions" / "Answer 11" — replace with "a quick assessment" / "about two minutes." Remove "73,960" / "431,000" / "435,000" record counts. Fix meta descriptions in layouts and page.tsx.

### Task 3: Other Pages Copy Rewrite
- **Owner:** builder-pages
- **Input:** Copy Guide replacement table + file list above
- **Output:** 9 files with all violations fixed
- **Dependencies:** none
- **Instructions:**
  Edit pricing/page.tsx ("Your AI Compliance Officer Is Ready" → "Your Compliance Officer Is Ready"), solutions/page.tsx (remove "AI-powered engine analyzes 73,960+"), calculator/page.tsx (remove all "73,960" references), about/page.tsx (remove "73,960+" stat), samples/page.tsx (verify "PROTEKON" not "AI"), partners pages, and 3 dashboard files (incidents/new: "classified by our AI system" → "classified by PROTEKON", incidents: "AI-powered classification" → "automated classification", intake: "Your AI compliance officer" → "PROTEKON" + "Answer 6 questions" → "A few questions about your business").

### Task 4: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results
- **Dependencies:** Task 1, Task 2, Task 3
- **Instructions:**
  Run quality gates: tsc, lint, build. These are copy-only changes so tests should not be affected. Report any failures for Fixer.

### Task 5: Copy Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Zero-violation confirmation
- **Dependencies:** Task 4
- **Instructions:**
  Grep the entire codebase for every pattern in the Copy Guide kill list. Confirm zero remaining instances of: "AI compliance officer" (outside sidebar wordmark), "73,960", "431,000", "435,000", "No email required", "No email wall", "Answer 11", "11 questions", "Scraped", "our enforcement database". Report any survivors.

## Execution Order
1. Task 1 + Task 2 + Task 3 (parallel — no file overlap)
2. Task 4: Validate (depends on 1, 2, 3)
3. Task 5: Copy Audit (depends on 4)

## References Consulted
- Protekon Copy Guide (user-provided, 5 rules + voice calibration)
- Brand kit voice pillars: Commanding, Authoritative, Protective, Precise

## Validation Criteria
- [ ] Zero instances of "AI compliance officer" in customer-facing copy (sidebar wordmark excepted)
- [ ] Zero instances of proprietary database counts (73,960 / 431,000 / 435,000 / 115K)
- [ ] Zero instances of "No email required" on lead capture pages
- [ ] Zero instances of "11 questions" / "Answer 11" / step counts
- [ ] All quality gates pass (tsc, lint, build)
- [ ] Meta descriptions updated (score layouts, score page)
