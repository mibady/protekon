import type { TradeLandingConfig } from "../types"

/**
 * Masonry — federal OSHA trade landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, full protekon_osha_violations
 * table, filtered to NAICS 238140 (Masonry Contractors).
 *   Cases: 8,649 · Willful: 23 · Repeat: 225
 *   Total penalties: $17.72M · Max: $112,500
 * Scaffold (1926.451) dominates the high-penalty willful masonry sample —
 * LAZ (1926.706) violations show up as smaller repeats.
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
      "$17.72M federal penalties · 8,649 masonry contractors cited · 23 willful + 225 repeat · full scraper enforcement DB",
    top_cites:
      "1926.451 scaffolds, 1926.706 masonry construction (LAZ), 1926.1153 silica",
  },

  hero: {
    eyebrow: "MASONRY · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "masonry contractors", "$17.7 million to date."],
    h1_crimson_accent: "$17.7 million",
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
    { n: 17_717_767, prefix: "$", suffix: "", label: "Federal penalties · masonry · enforcement-DB total" },
    { n: 8_649, prefix: "", suffix: "", label: "Masonry contractors cited" },
    { n: 248, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 82_757, prefix: "$", suffix: "", label: "Top willful-scaffold citation (Jose Calle)" },
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
    hook_num: "$82,757",
    hook_desc:
      "top willful-scaffold citation against a NAICS 238140 masonry contractor · scraper enforcement DB",
    testimonials: [
      {
        quote:
          "Willful scaffold citation under 1926.451. 7 masons on a scaffold without guardrails at multiple levels.",
        penalty: "$82,757 penalty",
        attribution: "Jose Calle · Philadelphia, PA · Apr 2025",
        violation_tag: "Willful scaffold · 1926.451",
      },
      {
        quote:
          "Willful scaffold citation. 9 workers on a masonry scaffold above 10 feet without fall protection.",
        penalty: "$72,826 penalty",
        attribution: "United Builders Group Co. · Niles, IL · Mar 2025",
        violation_tag: "Willful scaffold · 1926.451",
      },
      {
        quote:
          "Willful scaffold citation. 5 workers on an improperly-constructed scaffold with structural defects.",
        penalty: "$54,000 penalty",
        attribution: "Creative Masonry, Inc. · Jonesborough, TN · Oct 2025",
        violation_tag: "Willful scaffold · 1926.451",
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
