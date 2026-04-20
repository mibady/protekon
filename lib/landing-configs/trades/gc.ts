import type { TradeLandingConfig } from "../types"

/**
 * General Contractor — federal OSHA trade landing page config.
 * NAICS 236220 (commercial/institutional) and 236115/236118 (residential).
 * Dominant risk: multi-employer citation policy across all of 1926.
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
      "$186.4M federal penalties · 11,840 GCs cited · 31,520 violations · Since Jan 2025",
    top_cites:
      "1926.16 multi-employer worksite, 1926.501 falls, 1926.1153 silica, 1926.651 excavations",
  },

  hero: {
    eyebrow: "GENERAL CONTRACTOR · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "general contractors", "$186.4 million this year."],
    h1_crimson_accent: "$186.4 million",
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
    { n: 186_400_000, prefix: "$", suffix: "", label: "Federal penalties · GC · 2025 YTD" },
    { n: 11_840, prefix: "", suffix: "", label: "General contractors cited" },
    { n: 31_520, prefix: "", suffix: "", label: "Violations issued" },
    { n: 141_280, prefix: "$", suffix: "", label: "Average multi-employer citation" },
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
    hook_num: "$141,280",
    hook_desc:
      "average penalty on a multi-employer controlling-employer citation · 2024–2025 federal enforcement actions · GC NAICS",
    testimonials: [
      {
        quote:
          "Roofing sub had no fall protection. OSHA cited US as controlling employer. We had the sub contract but no safety orientation records.",
        penalty: "$165,514 penalty",
        attribution: "Orlando, FL · general contractor · Apr 2025",
        violation_tag: "Willful multi-employer · 1926.16",
      },
      {
        quote:
          "Excavation sub working in 8-foot trench with no protective system. Our site superintendent walked past it twice that day.",
        penalty: "$118,900 penalty",
        attribution: "Seattle, WA · general contractor · Sep 2024",
        violation_tag: "Repeat controlling · 1926.652",
      },
      {
        quote:
          "Serious citation for a silica violation by a core-drilling sub. We had no written policy requiring subs to submit exposure plans.",
        penalty: "$52,400 penalty",
        attribution: "Chicago, IL · general contractor · Jul 2025",
        violation_tag: "Serious multi-employer · 1926.1153",
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
