import type { TradeLandingConfig } from "../types"

/**
 * Concrete — federal OSHA trade landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, full protekon_osha_violations
 * table, filtered to NAICS 238110 (Concrete Foundation & Structure).
 *   Cases: 3,254 · Willful: 17 · Repeat: 48
 *   Total penalties: $8.03M · Max: $112,500
 * High-penalty sample shows excavation (1926.651/652) citations dominant —
 * foundation work puts crews in trenches, formwork violations are second.
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
      "$8.03M federal penalties · 3,254 concrete contractors cited · 17 willful + 48 repeat · full scraper enforcement DB",
    top_cites:
      "1926.651/652 excavation, 1926.701-706 concrete construction, 1926.1153 silica",
  },

  hero: {
    eyebrow: "CONCRETE · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "concrete contractors", "$8.03 million to date."],
    h1_crimson_accent: "$8.03 million",
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
    { n: 8_029_976, prefix: "$", suffix: "", label: "Federal penalties · concrete · enforcement-DB total" },
    { n: 3_254, prefix: "", suffix: "", label: "Concrete contractors cited" },
    { n: 65, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 104_860, prefix: "$", suffix: "", label: "Top willful-excavation citation (Alecksandro Pereira)" },
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
    hook_num: "$104,860",
    hook_desc:
      "top willful-excavation citation against a NAICS 238110 concrete contractor · scraper enforcement DB",
    testimonials: [
      {
        quote:
          "Willful excavation citation under 1926.651. Worker in a foundation trench without protective system.",
        penalty: "$104,860 penalty",
        attribution: "Alecksandro Tomaz Pereira · Hanson, MA · Feb 2024",
        violation_tag: "Willful excavation · 1926.651",
      },
      {
        quote:
          "Repeat excavation citation on a poured-wall project. 2 workers in an 8-ft trench, no sloping, no shield.",
        penalty: "$57,930 penalty",
        attribution: "Lacko Poured Walls, LLC · Grove City, OH · Mar 2025",
        violation_tag: "Repeat excavation · 1926.651",
      },
      {
        quote:
          "Repeat excavation citation. 3 workers at the bottom of a foundation trench without protective system.",
        penalty: "$55,000 penalty",
        attribution: "DBS, Inc. · Vail, CO · Jun 2023",
        violation_tag: "Repeat excavation · 1926.652",
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
