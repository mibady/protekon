import type { TradeLandingConfig } from "../types"

/**
 * HVAC — federal OSHA trade landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, full protekon_osha_violations
 * table, filtered to NAICS 238220 (Plumbing/Heating/Air-Conditioning
 * Contractors — shared with plumbing).
 *   Cases: 5,369 combined · Willful: 18 · Repeat: 79
 *   Total penalties: $11.34M · Max: $112,926
 * HVAC-specific high-penalty sample is rooftop fall protection — solar
 * installers and commercial mechanical contractors both cited under 238220.
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
      "$11.34M federal penalties · 5,369 mechanical contractors cited · 18 willful + 79 repeat · full scraper enforcement DB",
    top_cites:
      "1926.501/502 rooftop fall protection, 1910.147 lockout/tagout, 1926.651 excavation",
  },

  hero: {
    eyebrow: "HVAC · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "HVAC contractors", "$11.3 million to date."],
    h1_crimson_accent: "$11.3 million",
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
    { n: 11_336_316, prefix: "$", suffix: "", label: "Federal penalties · 238220 · enforcement-DB total" },
    { n: 5_369, prefix: "", suffix: "", label: "Mechanical contractors cited" },
    { n: 97, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 106_000, prefix: "$", suffix: "", label: "Top repeat rooftop-fall citation (Geoscape Solar)" },
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
    hook_num: "$106,000",
    hook_desc:
      "top repeat rooftop-fall citation against a NAICS 238220 mechanical contractor · scraper enforcement DB",
    testimonials: [
      {
        quote:
          "Repeat fall-protection citation. 10 workers on a commercial roof without conventional protection during a rooftop install.",
        penalty: "$106,000 penalty",
        attribution: "Geoscape Solar LLC · Parsippany, NJ · Apr 2023",
        violation_tag: "Repeat rooftop fall · 1926.501",
      },
      {
        quote:
          "Repeat fall-protection citation. 2 techs on a commercial rooftop unit changeout, edge within 6 ft, no guardrails or personal fall arrest.",
        penalty: "$15,970 penalty",
        attribution: "CM3 Inc. · Wichita, KS · Mar 2024",
        violation_tag: "Repeat rooftop fall · 1926.501",
      },
      {
        quote:
          "Repeat fall-protection citation. 5 techs on a commercial rooftop doing mechanical install without edge protection.",
        penalty: "$9,000 penalty",
        attribution: "Direct Mechanical, Inc. · Wheeling, IL · Apr 2023",
        violation_tag: "Repeat rooftop fall · 1926.501",
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
