# Landing Pages — Status & Future Work

**Last updated:** 2026-04-20 (end of state-templates session)
**Next planned work:** Drip + PDF + result-page funnel (separate plan to come)

---

## What's Shipped

### Architecture
Two config-driven templates + two first-class special cases. All landing pages render from a single template + one editorial-copy config per slug. Configs live in git (no Supabase). Scoring engine (Layer 1: `verticals` table → `ScoreWizard.tsx` → `score-calculator.ts`) is untouched.

```
app/score/
├── national/                            ← special case (untouched)
├── california/                          ← special case (untouched, SB 553 framing)
├── trade/[trade]/                       ← dynamic route, 8 configs
└── state/[state]/                       ← dynamic route, 3 configs

components/score/landing/
├── TradeLanding.tsx                     ← NAICS-driven template
└── StateLanding.tsx                     ← jurisdiction-driven template

lib/landing-configs/
├── types.ts                             ← TradeLandingConfig + StateLandingConfig
├── index.ts                             ← getTradeConfig / getStateConfig + listers
├── trades/   (8 configs)                ← roofing, framing, electrical, plumbing, hvac, concrete, masonry, gc
└── states/   (3 configs)                ← michigan, oregon, washington
```

### Pages Live

| Route | Type | Data source | Real enforcement $ |
|---|---|---|---|
| `/score/national` | special case | static | — |
| `/score/california` | special case | static | $164M (Cal/OSHA) |
| `/score/trade/roofing` | TradeLanding | NAICS 238160 | $151.83M · 44,781 cases |
| `/score/trade/framing` | TradeLanding | NAICS 238130 | $88.89M · 28,920 cases |
| `/score/trade/gc` | TradeLanding | NAICS 236220 + 236115 | $45.09M · 17,855 cases |
| `/score/trade/masonry` | TradeLanding | NAICS 238140 | $17.72M · 8,649 cases |
| `/score/trade/electrical` | TradeLanding | NAICS 238210 | $12.74M · 4,403 cases |
| `/score/trade/plumbing` | TradeLanding | NAICS 238220 | $11.34M · 5,369 cases (shared w/ HVAC) |
| `/score/trade/hvac` | TradeLanding | NAICS 238220 | $11.34M · 5,369 cases (shared w/ plumbing) |
| `/score/trade/concrete` | TradeLanding | NAICS 238110 | $8.03M · 3,254 cases |
| `/score/state/michigan` | StateLanding | MIOSHA | $18.92M · 27,131 cases · $70K max |
| `/score/state/oregon` | StateLanding | OR-OSHA | $21.77M · 17,803 cases · $115K max |
| `/score/state/washington` | StateLanding | DOSH | $48.53M · 39,751 cases · $165K max |

**Redirects wired** (`next.config.mjs`): short URLs like `/score/roofing`, `/score/michigan` → canonical `/score/trade/*` or `/score/state/*`.

### Wizard Deep-Link
Trade landing CTAs push `/score?start=true&industry=<slug>`. `ScoreWizard.tsx` reads `?industry=` on mount and pre-selects the dropdown. State pages push plain `/score?start=true` (no pre-select — states aren't NAICS).

### Data Source (single table, all geography)
- Supabase project: `vizmtkfpxxjzlpzibate` (scraper DB)
- Table: `protekon_osha_violations`
- Columns used: `state, naics_code, employer_name, city, inspection_date, violation_type, standard_cited, penalty_amount, nr_exposed`
- Adding a new page = one SQL pull filtered by state or naics_code, stamp config, commit. No new tables, no new tools.

---

## Adding Another Page (cookbook)

**New trade:**
1. Write `lib/landing-configs/trades/<slug>.ts` (~150 lines). Use existing trade configs as templates.
2. Register in `lib/landing-configs/index.ts` inside `TRADE_CONFIGS`.
3. Pull real data: `SELECT ... FROM protekon_osha_violations WHERE naics_code = '<NAICS>' ...`
4. Stamp aggregates into `header.stats_line`, `agg[]`, `desire.hook_num`, `desire.testimonials[]`.
5. Redirect optional: add `/score/<slug>` → `/score/trade/<slug>` in `next.config.mjs`.

**New state:** same pattern with `states/<slug>.ts` + `STATE_CONFIGS` + `state` filter.

`generateStaticParams` picks up new entries at build time — no route code changes needed.

---

## Future Features — States & Trades Axis

### Expansion (mechanical, same pattern)
- **18 remaining OSHA state plans** — AK, AZ, HI, IN, IA, KY, MD, MN, NV, NM, NC, PR, SC, TN, UT, VT, VA, WY
  - Each = 1 config file + real SQL pull. ~30 min per state.
  - Priority only if your ICP has compliance ops in those jurisdictions.
- **Federal-OSHA-by-state pages** (TX, FL, GA, OH, PA, NY, etc. — states WITHOUT a state plan)
  - Needs a design call: extend `StateLandingConfig` with an optional `agency_type: 'state_plan' | 'federal'` field, OR spin off `FederalStateLanding.tsx` as a third template.
  - Volume matters — TX, FL, GA have large federal-OSHA enforcement footprints.
- **More trades within existing template** — e.g. painting (NAICS 238320), drywall (NAICS 238310), excavation (NAICS 238910), glass (NAICS 238150). Same config pattern.

### New templates (different narrative)
- **`TopicLanding.tsx`** — anxiety-driven worry-topic pages: heat-illness, first-osha-inspection, ab5-misclassification, silica-exposure, workplace-violence-plan. Different config shape from trade/state — topic pages typically lead with a scenario and a specific rule, not a NAICS or jurisdiction.

### Infrastructure improvements
- **Quarterly config-sync script** — `scripts/sync-landing-configs-from-scraper.ts` that runs the per-slug SQL, diffs aggregate numbers, and proposes config updates via a PR. Would keep numbers fresh without manual refreshes.
- **Shared section components** — if config divergence outgrows param-driven text (e.g., per-trade hero layouts), extract `Hero.tsx`, `CompareTable.tsx`, `FAQ.tsx` under `components/score/landing/sections/`. Don't pre-decompose — wait for real pressure.
- **A/B testing harness** — swap hero eyebrow / CTA copy / scorecard variant. GrowthBook or Vercel Edge Config experiments could live at the `<config>` layer.
- **Sitemap + SEO** — add all trade + state slugs to `app/sitemap.ts`, pre-generate OG images per config (via `generateImageMetadata` or `@vercel/og`).
- **Fix the broken scraper MCP tool** — `mcp__claude_ai_nGeniusPro_Scraper__protekon_get_osha_enforcement_stats` calls a missing RPC `public.get_protekon_osha_stats`. Either create the RPC against the existing pre-built views (`protekon_v_industry_fines`, `protekon_v_top_standards`, `protekon_v_state_fines`, etc.) or retire the tool and replace with a views-backed one.

### Known gap
- **HVAC and Plumbing share NAICS 238220** (Plumbing/Heating/A-C Contractors) — there's no clean federal way to split them in the data. Both pages currently show the same combined totals with different trade-framed narratives. If deeper split is needed, would require partitioning by standard_cited signature (excavation-heavy = plumbing, rooftop-heavy = HVAC).

---

## Out of Scope (Separate Plans)

These are adjacent to landing pages but not part of the config-driven refactor:

1. **Drip + PDF + result-page funnel** — next session's work. Wires the Day 0/1/3/5/7 nurture, PDF download, shareable broker URL. Extends existing `inngest/functions/score-drip.ts`.
2. **Onboarding wizard (post-signup)** — 7-step paid onboarding previously drafted in `.claude/plans/1-is-our-onbaurding-humble-squid.md` (historical). Not active.
3. **Customer.io lead sync** — backlog.

---

## Governance

- **Don't touch Layer 1.** `lib/score-calculator.ts`, `lib/types/score.ts`, `lib/actions/score.ts`, `components/score/ScoreWizard.tsx`, `verticals` table — all stay as-is.
- **Don't touch CA or National.** Both are special-case pages with bespoke framing.
- **Don't put editorial copy in Supabase.** Configs are git-versioned, type-checked, code-reviewed.
- **Don't pre-decompose.** Extract shared section components only when divergent per-config logic can't fit through params.
