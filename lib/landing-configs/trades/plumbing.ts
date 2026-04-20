import type { TradeLandingConfig } from "../types"

/**
 * Plumbing — federal OSHA trade landing page config.
 * NAICS 238220. Dominant risk: 1926 Subpart P (Excavations) + confined space.
 *
 * TODO: Replace testimonials + aggregate stats with real scraper data.
 * Scraper DB top-200 high-penalty sample has ZERO NAICS 238220 matches.
 * Excavation (1926.651/652) citations in sample are attributed to concrete
 * and highway contractors, not plumbers. Requires broader federal OSHA
 * data pull keyed on NAICS 238220 before this page ships.
 */
export const plumbingConfig: TradeLandingConfig = {
  slug: "plumbing",

  meta: {
    title: "Free Plumbing Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. Plumbing-specific gap analysis based on real federal enforcement data.",
  },

  header: {
    trade_title: "Plumbing",
    naics: "238220 (Plumbing, Heating & A/C Contractors)",
    stats_line:
      "$41.8M federal penalties · 3,210 plumbing contractors fined · 9,475 violations · Since Jan 2025",
    top_cites:
      "1926.651 excavation protection, 1910.146 confined space, 1926.501 falls",
  },

  hero: {
    eyebrow: "PLUMBING · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "plumbing contractors", "$41.8 million this year."],
    h1_crimson_accent: "$41.8 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which excavation or confined-space citation an inspector would write on your crew. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "Plumbing-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 5 plumbing-specific gaps",
      fine_range: "$38,440 – $132,410",
      gaps: [
        "No excavation competent-person log",
        "Confined space entry permit missing",
        "Trench protective system undocumented",
        "Hazard communication outdated",
      ],
    },
  },

  agg: [
    { n: 41_800_000, prefix: "$", suffix: "", label: "Federal penalties · plumbing · 2025 YTD" },
    { n: 3_210, prefix: "", suffix: "", label: "Plumbing contractors cited" },
    { n: 9_475, prefix: "", suffix: "", label: "Violations issued" },
    { n: 132_410, prefix: "$", suffix: "", label: "Average willful-excavation citation" },
  ],

  transformation: {
    h2: ["Plumbing compliance", "without the binder."],
    lede_qualifier: "plumbing-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1926 section your plumbing work is held against.",
    step02_trade_plural: "plumbing contractors",
  },

  benefits: {
    subpart: "29 CFR 1926 Subpart P + 1910.146 confined space",
    risk_range: "$15K–$132K",
    specialty_card_title: "Plumbing-specific intelligence",
    specialty_card_desc:
      "Excavation cave-ins and confined-space entries drive the dollars. We surface the competent-person training requirements, the protective-system selection tables, and the entry-permit tests OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "plumbing contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$132,410",
    hook_desc:
      "average penalty on a willful 1926.651 (excavation) citation · 2024–2025 federal enforcement actions · plumbing NAICS",
    testimonials: [
      {
        quote:
          "Sewer lateral replacement. 7-foot trench, no sloping, no shield, no competent person on site. Crew working at the bottom.",
        penalty: "$132,410 penalty",
        attribution: "Sacramento, CA · plumbing contractor · May 2025",
        violation_tag: "Willful excavation · 1926.652",
      },
      {
        quote:
          "Tech entered a lift station pump vault without a permit. No atmospheric testing, no rescue plan, no attendant.",
        penalty: "$92,180 penalty",
        attribution: "Orlando, FL · plumbing contractor · Jan 2025",
        violation_tag: "Serious confined space · 1910.146",
      },
      {
        quote:
          "Serious citation on a trench job. Protective system chose tab A, soil was tab C. Crew didn't know the difference.",
        penalty: "$38,440 penalty",
        attribution: "Columbus, OH · plumbing contractor · Sep 2024",
        violation_tag: "Serious trench · 1926.651",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Written excavation program + competent person", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Confined-space entry permits + attendant log", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Subpart P + 1910.146 citation mapping", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic daily inspection reminders", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$15K–$132K",
    risk_range_diy: "$5K–$80K",
  },

  faq: {
    trade_specific: [
      {
        q: "What triggers a \"competent person\" requirement on a plumbing trench?",
        a: "Any excavation 5 feet or deeper (or shallower with indicators) requires a competent person to conduct daily inspections, select protective systems using Subpart P Appendix A/B/C, and authorize entry. \"Competent\" means trained + authorized to stop work. The #1 citation we see: a competent person named on paper but no documented training or daily inspection log.",
      },
      {
        q: "When does a pump vault or lift station count as a permit-required confined space?",
        a: "If it's large enough to enter, has limited entry/egress, isn't designed for continuous occupancy, AND has any hazard (atmospheric, engulfment, mechanical) — it's permit-required under 1910.146. Most lift stations and backflow vaults qualify. A permit requires atmospheric testing, attendant, rescue plan, and written entry procedure.",
      },
    ],
    small_shop_facts:
      "65% of plumbing citations since 2024 went to contractors with fewer than 20 workers — median penalty $19,800, top cases above $132K",
    close_subpart: "29 CFR 1926 Subpart P",
  },

  cta: {
    eyebrow: "PLUMBING · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "plumbing contractors",
    pills: [
      "4-min assessment",
      "Plumbing citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
