import type { TradeLandingConfig } from "../types"

/**
 * Masonry — federal OSHA trade landing page config.
 * NAICS 238140. Dominant risk: 1926 Subpart Q (masonry construction) + scaffolds + silica.
 */
export const masonryConfig: TradeLandingConfig = {
  slug: "masonry",

  meta: {
    title: "Free Masonry Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. Masonry-specific gap analysis based on real federal enforcement data.",
  },

  header: {
    trade_title: "Masonry",
    naics: "238140 (Masonry Contractors)",
    stats_line:
      "$34.6M federal penalties · 2,480 masonry contractors fined · 7,320 violations · Since Jan 2025",
    top_cites:
      "1926.706 masonry construction, 1926.451 scaffolds, 1926.1153 silica",
  },

  hero: {
    eyebrow: "MASONRY · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "masonry contractors", "$34.6 million this year."],
    h1_crimson_accent: "$34.6 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which limited-access zone, scaffold, or silica citation an inspector would write on your crew. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "Masonry-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 5 masonry-specific gaps",
      fine_range: "$41,200 – $128,420",
      gaps: [
        "No limited-access zone established",
        "Scaffold inspection log missing",
        "Silica control plan outdated",
        "PPE program gaps",
      ],
    },
  },

  agg: [
    { n: 34_600_000, prefix: "$", suffix: "", label: "Federal penalties · masonry · 2025 YTD" },
    { n: 2_480, prefix: "", suffix: "", label: "Masonry contractors cited" },
    { n: 7_320, prefix: "", suffix: "", label: "Violations issued" },
    { n: 112_840, prefix: "$", suffix: "", label: "Average willful-scaffold citation" },
  ],

  transformation: {
    h2: ["Masonry compliance", "without the binder."],
    lede_qualifier: "masonry-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1926 section your masonry work is held against.",
    step02_trade_plural: "masonry contractors",
  },

  benefits: {
    subpart: "29 CFR 1926 Subpart Q + Subpart L + 1926.1153",
    risk_range: "$14K–$128K",
    specialty_card_title: "Masonry-specific intelligence",
    specialty_card_desc:
      "Limited-access zones, scaffold collapses, and silica cutting drive the dollars. We surface the LAZ distance rules (height + 4 feet), the scaffold guardrail requirements, and the Table 1 silica controls OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "masonry contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$112,840",
    hook_desc:
      "average penalty on a willful scaffold or LAZ citation · 2024–2025 federal enforcement actions · masonry NAICS",
    testimonials: [
      {
        quote:
          "CMU wall construction, 14 feet tall. No limited-access zone. Laborers walked into the fall zone during lift.",
        penalty: "$128,420 penalty",
        attribution: "Houston, TX · masonry contractor · Mar 2025",
        violation_tag: "Willful LAZ · 1926.706",
      },
      {
        quote:
          "Tubular frame scaffold above 10 feet, no guardrails, no documented inspection. Mason fell 14 feet onto rebar.",
        penalty: "$88,100 penalty",
        attribution: "Atlanta, GA · masonry contractor · Jul 2024",
        violation_tag: "Repeat scaffold · 1926.451",
      },
      {
        quote:
          "Brick cutting with a dry saw, no water, no vac attachment, no respirators, no exposure plan. Dust visible from 50 feet.",
        penalty: "$41,200 penalty",
        attribution: "Nashville, TN · masonry contractor · Oct 2024",
        violation_tag: "Serious silica · 1926.1153",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Limited-access zone (LAZ) plan + markings", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Scaffold inspection log + guardrail program", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Silica control plan + Table 1 controls", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic crew training reminders", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$14K–$128K",
    risk_range_diy: "$4K–$72K",
  },

  faq: {
    trade_specific: [
      {
        q: "When does 1926.706 require a limited-access zone (LAZ)?",
        a: "Any wall over 8 feet high that isn't adequately supported requires a LAZ equal to the wall height plus 4 feet, extending the full length of the wall. Only employees actively constructing the wall may enter. The #1 citation we see: LAZ mentioned in training but not marked on site. Protekon's template pairs the plan with cone/tape placement specs.",
      },
      {
        q: "What scaffold rule gets masonry contractors cited most?",
        a: "1926.451(g)(1) — guardrails on scaffolds above 10 feet. The standard is simple; the failure pattern is getting distracted by the wall work and skipping the fall protection review. Protekon generates a daily pre-shift inspection checklist per scaffold type you use.",
      },
    ],
    small_shop_facts:
      "71% of masonry citations since 2024 went to contractors with fewer than 20 masons — median penalty $18,900, top cases above $128K",
    close_subpart: "29 CFR 1926 Subpart Q",
  },

  cta: {
    eyebrow: "MASONRY · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "masonry contractors",
    pills: [
      "4-min assessment",
      "Masonry citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
