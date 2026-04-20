import type { TradeLandingConfig } from "../types"

/**
 * General Contractor — federal OSHA trade landing page config.
 *
 * Testimonials pulled from scraper DB vizmtkfpxxjzlpzibate — top-200
 * high-penalty federal OSHA cases, filtered to NAICS 236220/236115/236118
 * (General Contractors) and standards 1910/1926 (federal-only, excluding
 * state-plan codes). 22 federal-standard cases in sample across 3 unique
 * employers. Controlling-employer doctrine is the animating risk.
 */
export const gcConfig: TradeLandingConfig = {
  slug: "gc",

  meta: {
    title: "Free General Contractor Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. GC-specific gap analysis based on real federal enforcement data. Covers multi-employer worksite liability.",
  },

  header: {
    trade_title: "General Contractor",
    naics: "236220 / 236115 (General Contractors)",
    stats_line:
      "$45.09M federal penalties · 17,855 GCs cited · 125 willful + 559 repeat · NAICS 236220 + 236115, full scraper enforcement DB",
    top_cites:
      "1926.16 multi-employer worksite, 1926.501 falls, 1926.1153 silica, 1926.651 excavations",
  },

  hero: {
    eyebrow: "GENERAL CONTRACTOR · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "general contractors", "$45.1 million to date."],
    h1_crimson_accent: "$45.1 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which multi-employer citation an inspector would hang on you for a sub's violation. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "GC / multi-employer benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 4,
      denom: 11,
      posture_label: "At risk — 7 GC-specific gaps",
      fine_range: "$52,400 – $165,514",
      gaps: [
        "No multi-employer worksite policy",
        "COI verification gaps on active subs",
        "Site-specific safety plan missing",
        "Subcontractor safety orientation undocumented",
      ],
    },
  },

  agg: [
    { n: 45_090_042, prefix: "$", suffix: "", label: "Federal penalties · GC · enforcement-DB total" },
    { n: 17_855, prefix: "", suffix: "", label: "GCs cited (236220 + 236115)" },
    { n: 684, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 165_514, prefix: "$", suffix: "", label: "Top willful citation (statutory max)" },
  ],

  transformation: {
    h2: ["GC compliance", "without the binder."],
    lede_qualifier: "GC-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1926 section your GC scope is held against — including the multi-employer citation policy.",
    step02_trade_plural: "general contractors",
  },

  benefits: {
    subpart: "29 CFR 1926 multi-employer (controlling employer doctrine)",
    risk_range: "$20K–$165K",
    specialty_card_title: "GC / multi-employer intelligence",
    specialty_card_desc:
      "OSHA's controlling-employer doctrine means you own your subs' violations. We surface the COI verification requirements, the site-specific safety plan tests, and the orientation logs OSHA inspectors walk with — so when a sub gets cited, you don't get stacked.",
    trade_plural: "general contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$165,514",
    hook_desc:
      "federal statutory max for a willful citation — 125 such citations issued against GCs in the scraper enforcement DB (NAICS 236220 + 236115)",
    testimonials: [
      {
        quote:
          "Willful steel-erection citation. 25 workers exposed across multiple trade partners on site. GC was controlling employer.",
        penalty: "$161,323 penalty",
        attribution: "Big D Builders, Inc. · Boise, ID · Feb 2024",
        violation_tag: "Willful steel erection · 1926.754",
      },
      {
        quote:
          "Willful scaffold citation. Sub's scaffold above 10 feet without guardrails. GC's site super had walked past it.",
        penalty: "$154,696 penalty",
        attribution: "Paramount Builders, Ltd. · Pago Pago, AS · Jan 2023",
        violation_tag: "Willful scaffold · 1926.451",
      },
      {
        quote:
          "Willful fall-protection citation. Four workers on a leading edge, no conventional protection. GC named as controlling employer alongside the exposing sub.",
        penalty: "$153,742 penalty",
        attribution: "Thomas Builders of Virginia, Inc. · Roanoke, VA · Aug 2023",
        violation_tag: "Willful fall protection · 1926.501",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Multi-employer worksite policy + sub verification", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "COI + insurance tracking across all subs", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Site-specific safety plan + daily inspection log", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic sub safety-orientation + renewal reminders", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$20K–$165K",
    risk_range_diy: "$7K–$100K",
  },

  faq: {
    trade_specific: [
      {
        q: "Can OSHA cite us for a sub's violation?",
        a: "Yes. The Multi-Employer Citation Policy (CPL 02-00-124) recognizes 4 roles: creating, exposing, correcting, and CONTROLLING employer. GCs are almost always the controlling employer. If you had authority to correct the hazard and didn't exercise reasonable care — you get cited. The #1 defense: a documented site-specific safety plan + sub orientation records.",
      },
      {
        q: "What does \"reasonable care\" look like to an inspector?",
        a: "A documented safety program, pre-award review of sub safety records, site-specific orientation for each sub, and documented walk-arounds by a competent person. Protekon generates the orientation log, the daily inspection template, and tracks each sub's COI + safety credential status.",
      },
    ],
    small_shop_facts:
      "58% of GC citations since 2024 went to firms with fewer than 50 workers — median penalty $28,400, top cases above $165K",
    close_subpart: "29 CFR 1926 multi-employer (controlling employer)",
  },

  cta: {
    eyebrow: "GENERAL CONTRACTOR · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "general contractors",
    pills: [
      "4-min assessment",
      "Multi-employer risk mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
