# Protekon Competitive Positioning — Internal / Sales Only

> **Do not ship this verbatim to the public site.** It contains raw moat numbers
> that contradict the public copy guide (consequence-first, Protekon-as-actor,
> no data-moat quantifiers). Use in 1:1 sales conversations, decks, and partner
> briefings where the numbers close deals.

## Two-layer architecture (internal numbers)

### National — OSHA enforcement intelligence
- 852K+ violations tracked, 57 states & territories, 27 verticals, 2020–present
- $2.06B total penalties tracked
- 18,590 monthly trend data points with z-score anomaly detection
- 1,080 nearby enforcement actions with city/county/penalty granularity
- 689 industry stat records (avg penalty, CI bounds, serious %)
- 908 pre-generated enforcement alerts across 27 verticals

### California — CSLB contractor license monitoring
- 243,252 licensed contractors, all 58 CA counties
- 10,399 currently suspended (visible on CSLB lookup)
- 4,060 CLEAR status with WC lapsed — invisible to manual checks
- 13,987 licenses expiring within 60 days
- 290 WC carriers tracked; State Fund at 24.7% market share

## Cross-check edge

### COI date vs CSLB WC date
When a subcontractor uploads a Certificate of Insurance, Protekon extracts the
workers' comp expiration date using Document AI and compares it against the WC
expiration date on file in CSLB. A contractor can submit a COI showing a current
WC policy while CSLB already shows it lapsed. A 30-day discrepancy triggers a
review flag. No COI management platform has the CSLB data to do this comparison.
No CSLB scraper has the COI processing pipeline. Protekon has both.

**Scenario:** a GC approves a sub on a valid-looking COI, work begins, an injury
occurs, and the WC carrier denies the claim because the policy lapsed three
weeks earlier.

### Enforcement-informed document generation
WVPP and IIPP generation for construction clients pulls from the enforcement
stats layer to reflect real Cal/OSHA citation patterns in that industry over the
past 12 months. $43.8M in California construction penalties across 7,033 cited
employers informs hazard prioritization in the plan.

Competitors generate compliance documents from static templates. Protekon
generates them from enforcement data.

## Competitive breakdown

| Platform | Category | Enforcement data | License monitoring | Stealth WC | Cross-check | Doc gen |
|---|---|---|---|---|---|---|
| **Protekon** | Compliance CaaS | Yes — 57 states, 27 verticals | Yes — daily delta, 243K CA | Yes — unique | Yes — COI vs CSLB WC | Yes — enforcement-informed |
| MyCOI / EvidentID | COI management | No | No | No | No | No |
| Jones (GetJones) | Construction insurance | No | No | No | No | No |
| Safesite / Salus | Safety compliance | No | No | No | No | Templates only |
| DataAxle / BuildFax | License data | No | Point-in-time only | No | No | No |
| Oshalink / VelocityEHS | EHS platforms | Some — not by vertical | No | No | No | Templates only |

## Source

Extracted from `docs/protekon_differentiator_full.html` (retired 2026-04-14,
session 27). Public-facing rewrites of the same material live in
`components/sections/Hero.tsx`, `app/solutions/construction/page.tsx`,
`app/industries/[slug]/page.tsx`, `app/about/page.tsx`, and
`components/marketing/CaliforniaScopeNote.tsx`.
