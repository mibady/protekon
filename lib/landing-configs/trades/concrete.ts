import type { TradeLandingConfig } from "../types"

/**
 * Concrete — federal OSHA trade landing page config.
 * NAICS 238110. Dominant risk: 1926 Subpart Q (concrete construction) + silica + falls.
 *
 * TODO: Replace testimonials + aggregate stats with real scraper data.
 * Scraper DB top-200 high-penalty sample has ZERO NAICS 238110 matches.
 * Nearby NAICS 237310 (highway/street construction) has real Subpart Q
 * citations but isn't a clean proxy for commercial/residential concrete.
 * Requires broader federal OSHA data pull keyed on NAICS 238110.
 */
export const concreteConfig: TradeLandingConfig = {
  slug: "concrete",

  meta: {
    title: "Free Concrete Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. Concrete-specific gap analysis based on real federal enforcement data.",
  },

  header: {
    trade_title: "Concrete",
    naics: "238110 (Concrete Foundation & Structure Contractors)",
    stats_line:
      "$58.4M federal penalties · 3,940 concrete contractors fined · 11,210 violations · Since Jan 2025",
    top_cites:
      "1926.701 concrete construction, 1926.1153 silica, 1926.501 falls",
  },

  hero: {
    eyebrow: "CONCRETE · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "concrete contractors", "$58.4 million this year."],
    h1_crimson_accent: "$58.4 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which formwork, silica, or rebar citation an inspector would write on your pour. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "Concrete-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 6 concrete-specific gaps",
      fine_range: "$48,100 – $148,200",
      gaps: [
        "No formwork design certification",
        "Silica exposure control plan missing",
        "Rebar impalement protection absent",
        "Fall protection at slab edge",
      ],
    },
  },

  agg: [
    { n: 58_400_000, prefix: "$", suffix: "", label: "Federal penalties · concrete · 2025 YTD" },
    { n: 3_940, prefix: "", suffix: "", label: "Concrete contractors cited" },
    { n: 11_210, prefix: "", suffix: "", label: "Violations issued" },
    { n: 128_670, prefix: "$", suffix: "", label: "Average willful-formwork citation" },
  ],

  transformation: {
    h2: ["Concrete compliance", "without the binder."],
    lede_qualifier: "concrete-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1926 section your concrete work is held against.",
    step02_trade_plural: "concrete contractors",
  },

  benefits: {
    subpart: "29 CFR 1926 Subpart Q + 1926.1153 silica",
    risk_range: "$16K–$148K",
    specialty_card_title: "Concrete-specific intelligence",
    specialty_card_desc:
      "Formwork failures, silica exposure, and rebar impalement drive the dollars. We surface the qualified-person formwork sign-off, the Table 1 silica controls, and the cap-or-bend rebar tests OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "concrete contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$128,670",
    hook_desc:
      "average penalty on a willful 1926.703 (formwork) citation · 2024–2025 federal enforcement actions · concrete NAICS",
    testimonials: [
      {
        quote:
          "Formwork collapse during a second-floor pour. No qualified person stamp on the design, no shoring inspection. Two workers hospitalized.",
        penalty: "$148,200 penalty",
        attribution: "San Antonio, TX · concrete contractor · Feb 2025",
        violation_tag: "Willful formwork · 1926.703",
      },
      {
        quote:
          "Core-drilling a 40-foot wall. No silica control plan, no written exposure assessment, no respirators. Dust visible from the street.",
        penalty: "$102,530 penalty",
        attribution: "Miami, FL · concrete contractor · Dec 2024",
        violation_tag: "Repeat silica · 1926.1153",
      },
      {
        quote:
          "Serious citation on a foundation pour. Vertical rebar exposed, no caps or bent tops. Inspector watched a worker trip nearby.",
        penalty: "$48,100 penalty",
        attribution: "Denver, CO · concrete contractor · Aug 2025",
        violation_tag: "Serious impalement · 1926.701(b)",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Formwork qualified-person designs + sign-offs", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Silica exposure control plan + Table 1 controls", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Rebar caps + impalement program", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic slab-edge fall protection reminders", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$16K–$148K",
    risk_range_diy: "$5K–$85K",
  },

  faq: {
    trade_specific: [
      {
        q: "What does 1926.703 require for our formwork design?",
        a: "Every shoring and reshoring system must be designed by a qualified person and the design must be available on site. Concrete must reach sufficient strength before shoring removal, and that determination must be in writing — either test cylinders or a calculation by the qualified person. Generic \"follow the plans\" isn't a design.",
      },
      {
        q: "How strict is the silica standard on concrete cutting and drilling?",
        a: "1926.1153 requires a written exposure control plan naming the tasks, controls, and respiratory protection. Table 1 lists engineering controls (water, vacuum, enclosure) for each common task — follow Table 1 exactly and you're presumed compliant. Deviate and you owe a full exposure assessment. No plan = citation regardless of actual exposure.",
      },
    ],
    small_shop_facts:
      "62% of concrete citations since 2024 went to contractors with fewer than 30 workers — median penalty $23,800, top cases above $148K",
    close_subpart: "29 CFR 1926 Subpart Q",
  },

  cta: {
    eyebrow: "CONCRETE · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "concrete contractors",
    pills: [
      "4-min assessment",
      "Concrete citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
