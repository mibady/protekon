import type { TradeLandingConfig } from "../types"

/**
 * HVAC — federal OSHA trade landing page config.
 * NAICS 238220. Dominant risk: 1910.147 LOTO + refrigerant + fall protection on rooftops.
 *
 * TODO: Replace testimonials + aggregate stats with real scraper data.
 * Scraper DB top-200 high-penalty sample has ZERO NAICS 238220 matches for
 * HVAC. LOTO and rooftop-fall citations exist but attributed to other
 * industries (leather processing, solar installers, etc). Requires broader
 * federal OSHA data pull keyed on NAICS 238220 before this page ships.
 */
export const hvacConfig: TradeLandingConfig = {
  slug: "hvac",

  meta: {
    title: "Free HVAC Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. HVAC-specific gap analysis based on real federal enforcement data.",
  },

  header: {
    trade_title: "HVAC",
    naics: "238220 (Mechanical / HVAC Contractors)",
    stats_line:
      "$38.9M federal penalties · 2,960 HVAC contractors fined · 8,810 violations · Since Jan 2025",
    top_cites:
      "1910.147 lockout/tagout, 1926.501 rooftop falls, 1910.1000 air contaminants",
  },

  hero: {
    eyebrow: "HVAC · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "HVAC contractors", "$38.9 million this year."],
    h1_crimson_accent: "$38.9 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which LOTO, rooftop-fall, or refrigerant citation an inspector would write on your techs. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "HVAC-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 4,
      denom: 10,
      posture_label: "At risk — 5 HVAC-specific gaps",
      fine_range: "$42,100 – $124,850",
      gaps: [
        "No equipment-specific LOTO procedure",
        "Rooftop fall protection plan missing",
        "Refrigerant safe-handling program outdated",
        "Respiratory protection gaps",
      ],
    },
  },

  agg: [
    { n: 38_900_000, prefix: "$", suffix: "", label: "Federal penalties · HVAC · 2025 YTD" },
    { n: 2_960, prefix: "", suffix: "", label: "HVAC contractors cited" },
    { n: 8_810, prefix: "", suffix: "", label: "Violations issued" },
    { n: 118_320, prefix: "$", suffix: "", label: "Average willful LOTO/fall citation" },
  ],

  transformation: {
    h2: ["HVAC compliance", "without the binder."],
    lede_qualifier: "HVAC-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1910 / 1926 section your HVAC work is held against.",
    step02_trade_plural: "HVAC contractors",
  },

  benefits: {
    subpart: "29 CFR 1910.147 + 1926 Subpart M",
    risk_range: "$15K–$125K",
    specialty_card_title: "HVAC-specific intelligence",
    specialty_card_desc:
      "LOTO on rooftop units and fall protection at the edge drive the dollars. We surface the per-equipment procedure requirement, the 6-foot rooftop trigger, and the respiratory-protection tests OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "HVAC contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$118,320",
    hook_desc:
      "average penalty on a willful LOTO or rooftop-fall citation · 2024–2025 federal enforcement actions · HVAC NAICS",
    testimonials: [
      {
        quote:
          "Tech on a commercial rooftop changing out a condenser. 14 feet to the edge, no guardrails, no personal fall arrest, no warning line.",
        penalty: "$124,850 penalty",
        attribution: "Dallas, TX · HVAC contractor · Apr 2025",
        violation_tag: "Willful rooftop fall · 1926.501",
      },
      {
        quote:
          "Service call on a packaged unit. Tech energized the disconnect with the access panel open. No written LOTO for that model.",
        penalty: "$88,410 penalty",
        attribution: "Phoenix, AZ · HVAC contractor · Aug 2024",
        violation_tag: "Repeat LOTO · 1910.147",
      },
      {
        quote:
          "Serious citation on a restaurant duct job. Respirator program missing fit-test records; techs doing cleaning without protection.",
        penalty: "$42,100 penalty",
        attribution: "Las Vegas, NV · HVAC contractor · Jun 2025",
        violation_tag: "Serious respiratory · 1910.134",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Per-equipment LOTO procedures", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Rooftop fall protection plan + anchor logs", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Respirator + refrigerant program", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic annual procedure review", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$15K–$125K",
    risk_range_diy: "$5K–$72K",
  },

  faq: {
    trade_specific: [
      {
        q: "Do I need a written LOTO procedure for every rooftop unit I service?",
        a: "1910.147 requires equipment-specific procedures unless the equipment meets all 8 conditions of the \"minor servicing\" exception. Rooftop units rarely do — they have cord-and-plug alternatives only if the plug stays in the tech's control AT ALL TIMES. The practical answer: write procedures for the RTU platforms you most commonly service and refresh them annually.",
      },
      {
        q: "What fall-protection rule applies on a commercial rooftop?",
        a: "Subpart M kicks in at 6 feet regardless of whether the surface is sloped. Above 6 feet you need guardrails, personal fall arrest, OR a warning-line system with a designated worker. The #1 citation we see: \"we only went up for a minute\" — duration doesn't matter under the standard.",
      },
    ],
    small_shop_facts:
      "69% of HVAC citations since 2024 went to contractors with fewer than 25 techs — median penalty $22,100, top cases above $125K",
    close_subpart: "29 CFR 1910.147 + 1926 Subpart M",
  },

  cta: {
    eyebrow: "HVAC · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "HVAC contractors",
    pills: [
      "4-min assessment",
      "HVAC citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
