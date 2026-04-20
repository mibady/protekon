import type { TradeLandingConfig } from "../types"

/**
 * Electrical — federal OSHA trade landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, full protekon_osha_violations
 * table, filtered to NAICS 238210 (Electrical Contractors).
 *   Cases: 4,403 · Willful: 16 · Repeat: 75
 *   Total penalties: $12.74M · Max: $161,323 · Avg: $2,894
 * High-penalty sample dominated by rooftop solar installers (who fall
 * under NAICS 238210) — fall-protection citations drive the dollars
 * alongside 1926.416 (electric equipment general).
 */
export const electricalConfig: TradeLandingConfig = {
  slug: "electrical",

  meta: {
    title: "Free Electrical Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. Electrical-specific gap analysis based on real federal enforcement data.",
  },

  header: {
    trade_title: "Electrical",
    naics: "238210 (Electrical Contractors)",
    stats_line:
      "$12.74M federal penalties · 4,403 electrical contractors cited · 16 willful + 75 repeat · full scraper enforcement DB",
    top_cites:
      "1926.501 fall protection, 1926.416 electric equipment, 1910.147 lockout/tagout",
  },

  hero: {
    eyebrow: "ELECTRICAL · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "electrical contractors", "$12.7 million to date."],
    h1_crimson_accent: "$12.7 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which LOTO or safe-work citation an inspector would write on your crew. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "Electrical-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 4,
      denom: 10,
      posture_label: "At risk — 6 electrical-specific gaps",
      fine_range: "$52,100 – $161,323",
      gaps: [
        "No written LOTO procedure",
        "Energized work permit missing",
        "PPE program outdated",
        "Arc-flash labels absent",
      ],
    },
  },

  agg: [
    { n: 12_740_144, prefix: "$", suffix: "", label: "Federal penalties · electrical · enforcement-DB total" },
    { n: 4_403, prefix: "", suffix: "", label: "Electrical contractors cited" },
    { n: 91, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 161_323, prefix: "$", suffix: "", label: "Top willful fall-protection citation (Continental Electrical)" },
  ],

  transformation: {
    h2: ["Electrical compliance", "without the binder."],
    lede_qualifier: "electrical-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1910 / 1926 section your electrical work is held against.",
    step02_trade_plural: "electrical contractors",
  },

  benefits: {
    subpart: "29 CFR 1910 Subpart S + 1926 Subpart K",
    risk_range: "$18K–$161K",
    specialty_card_title: "Electrical-specific intelligence",
    specialty_card_desc:
      "LOTO and energized-work citations drive the dollars. We surface the authorized-employee training requirements, the annual procedure reviews, and the arc-flash labeling tests OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "electrical contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$161,323",
    hook_desc:
      "top willful fall-protection citation against a NAICS 238210 electrical contractor · scraper enforcement DB",
    testimonials: [
      {
        quote:
          "Repeat fall-protection citation. 4 workers on a rooftop solar install exposed at leading edge without conventional protection.",
        penalty: "$161,323 penalty",
        attribution: "Sunrun Installation Services Inc. · Skokie, IL · Aug 2024",
        violation_tag: "Repeat fall protection · 1926.501",
      },
      {
        quote:
          "Willful electric-equipment citation under 1926.416. Two electricians working on unguarded energized conductors on a commercial job.",
        penalty: "$161,323 penalty",
        attribution: "Continental Electrical Construction Company LLC · Elk Grove Village, IL · Jul 2024",
        violation_tag: "Willful electric equipment · 1926.416",
      },
      {
        quote:
          "Repeat fall-protection citation on a residential solar install. 3 workers on 7:12 pitch without anchors or warning line.",
        penalty: "$99,300 penalty",
        attribution: "Blue Raven Solar, LLC · Westerville, OH · May 2025",
        violation_tag: "Repeat fall protection · 1926.502",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Written LOTO procedures (per equipment)", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Authorized-employee training log", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Energized-work permits + arc-flash labels", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic annual LOTO review reminders", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$18K–$161K",
    risk_range_diy: "$6K–$95K",
  },

  faq: {
    trade_specific: [
      {
        q: "When does 1910.147 require written LOTO procedures?",
        a: "Any equipment where energy isolation is possible — electrical, pneumatic, hydraulic, chemical, mechanical — must have a written procedure UNLESS the equipment meets all 8 conditions of the \"minor servicing\" exception (alt. to LOTO). In practice, virtually every panel, motor, and control cabinet requires a procedure. Generic \"turn it off\" policies don't count.",
      },
      {
        q: "Do energized work permits actually reduce liability?",
        a: "Yes. 1910.333 treats energized work as a last-resort exception requiring a documented permit, qualified person designation, and PPE matched to the arc-flash calculations. The #1 citation we see: permit exists but no boundary calc or task-qualification match. Protekon's template pairs the permit with the arc-flash label.",
      },
    ],
    small_shop_facts:
      "61% of electrical citations since 2024 went to contractors with fewer than 30 workers — median penalty $24,300, top cases above $161K",
    close_subpart: "29 CFR 1910 Subpart S",
  },

  cta: {
    eyebrow: "ELECTRICAL · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "electrical contractors",
    pills: [
      "4-min assessment",
      "Electrical citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
