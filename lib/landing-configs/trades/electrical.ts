import type { TradeLandingConfig } from "../types"

/**
 * Electrical — federal OSHA trade landing page config.
 * NAICS 238210. Dominant risk: 1910 Subpart S (electrical safety) + 1926 Subpart K.
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
      "$71.2M federal penalties · 5,893 electrical contractors fined · 16,420 violations · Since Jan 2025",
    top_cites:
      "1910.147 lockout/tagout, 1910.333 electrical safe work, 1910.132 PPE",
  },

  hero: {
    eyebrow: "ELECTRICAL · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "electrical contractors", "$71.2 million this year."],
    h1_crimson_accent: "$71.2 million",
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
    { n: 71_200_000, prefix: "$", suffix: "", label: "Federal penalties · electrical · 2025 YTD" },
    { n: 5_893, prefix: "", suffix: "", label: "Electrical contractors cited" },
    { n: 16_420, prefix: "", suffix: "", label: "Violations issued" },
    { n: 138_504, prefix: "$", suffix: "", label: "Average willful LOTO citation" },
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
    hook_num: "$138,504",
    hook_desc:
      "average penalty on a willful 1910.147 (LOTO) citation · 2024–2025 federal enforcement actions · electrical NAICS",
    testimonials: [
      {
        quote:
          "Apprentice working on a panel with the main energized. No written LOTO procedure for that equipment. Serious injury, OSHA showed up the next day.",
        penalty: "$161,323 penalty",
        attribution: "Houston, TX · electrical contractor · Feb 2025",
        violation_tag: "Willful LOTO · 1910.147",
      },
      {
        quote:
          "Energized-work job with no written permit, no arc-rated PPE, no documented qualified person. 480V gear.",
        penalty: "$112,420 penalty",
        attribution: "Charlotte, NC · electrical contractor · Nov 2024",
        violation_tag: "Repeat electrical · 1910.333",
      },
      {
        quote:
          "Serious citation on a service-entrance job. PPE program missing the arc-flash boundary calcs; gloves weren't rated for the task.",
        penalty: "$48,110 penalty",
        attribution: "Atlanta, GA · electrical contractor · Jul 2025",
        violation_tag: "Serious PPE · 1910.132",
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
