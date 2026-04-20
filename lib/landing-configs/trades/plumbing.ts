import type { TradeLandingConfig } from "../types"

/**
 * Plumbing — federal OSHA trade landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, full protekon_osha_violations
 * table, filtered to NAICS 238220 (Plumbing/Heating/Air-Conditioning
 * Contractors — shared with HVAC).
 *   Cases: 5,369 combined · Willful: 18 · Repeat: 79
 *   Total penalties: $11.34M · Max: $112,926
 * High-penalty plumbing sample dominated by excavation (1926.651/652)
 * citations — trench cave-ins are the outsize risk in the trade.
 */
export const plumbingConfig: TradeLandingConfig = {
  slug: "plumbing",

  meta: {
    title: "Free Plumbing Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. Plumbing-specific gap analysis based on real federal enforcement data.",
  },

  header: {
    trade_title: "Plumbing",
    naics: "238220 (Plumbing, Heating & A/C Contractors)",
    stats_line:
      "$11.34M federal penalties · 5,369 plumbing/HVAC contractors cited · 18 willful + 79 repeat · full scraper enforcement DB",
    top_cites:
      "1926.651/652 excavation protection, 1926.501 falls, 1910.146 confined space",
  },

  hero: {
    eyebrow: "PLUMBING · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "plumbing contractors", "$11.3 million to date."],
    h1_crimson_accent: "$11.3 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which excavation or confined-space citation an inspector would write on your crew. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "Plumbing-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 5 plumbing-specific gaps",
      fine_range: "$38,440 – $132,410",
      gaps: [
        "No excavation competent-person log",
        "Confined space entry permit missing",
        "Trench protective system undocumented",
        "Hazard communication outdated",
      ],
    },
  },

  agg: [
    { n: 11_336_316, prefix: "$", suffix: "", label: "Federal penalties · 238220 · enforcement-DB total" },
    { n: 5_369, prefix: "", suffix: "", label: "Contractors cited in NAICS 238220" },
    { n: 97, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 112_926, prefix: "$", suffix: "", label: "Top willful-excavation citation (Pyles Plumbing)" },
  ],

  transformation: {
    h2: ["Plumbing compliance", "without the binder."],
    lede_qualifier: "plumbing-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1926 section your plumbing work is held against.",
    step02_trade_plural: "plumbing contractors",
  },

  benefits: {
    subpart: "29 CFR 1926 Subpart P + 1910.146 confined space",
    risk_range: "$15K–$132K",
    specialty_card_title: "Plumbing-specific intelligence",
    specialty_card_desc:
      "Excavation cave-ins and confined-space entries drive the dollars. We surface the competent-person training requirements, the protective-system selection tables, and the entry-permit tests OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "plumbing contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$112,926",
    hook_desc:
      "top willful-excavation citation against a NAICS 238220 plumbing contractor · scraper enforcement DB",
    testimonials: [
      {
        quote:
          "Willful excavation citation under 1926.652. 3 workers in a utility trench without protective system — no shoring, no sloping, no shield.",
        penalty: "$112,926 penalty",
        attribution: "Pyles Plumbing and Utility Contractors, Inc. · Perry, GA · Aug 2023",
        violation_tag: "Willful excavation · 1926.652",
      },
      {
        quote:
          "Repeat excavation citation. Same trench-protection failure as a prior inspection, not abated.",
        penalty: "$79,048 penalty",
        attribution: "Pyles Plumbing and Utility Contractors, Inc. · Perry, GA · Aug 2023",
        violation_tag: "Repeat excavation · 1926.652",
      },
      {
        quote:
          "Willful excavation citation on a sewer lateral. Crew working at the bottom of a trench with no protective system.",
        penalty: "$57,000 penalty",
        attribution: "American Rooter LLC · Moosic, PA · May 2025",
        violation_tag: "Willful excavation · 1926.652",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Written excavation program + competent person", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Confined-space entry permits + attendant log", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Subpart P + 1910.146 citation mapping", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic daily inspection reminders", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$15K–$132K",
    risk_range_diy: "$5K–$80K",
  },

  faq: {
    trade_specific: [
      {
        q: "What triggers a \"competent person\" requirement on a plumbing trench?",
        a: "Any excavation 5 feet or deeper (or shallower with indicators) requires a competent person to conduct daily inspections, select protective systems using Subpart P Appendix A/B/C, and authorize entry. \"Competent\" means trained + authorized to stop work. The #1 citation we see: a competent person named on paper but no documented training or daily inspection log.",
      },
      {
        q: "When does a pump vault or lift station count as a permit-required confined space?",
        a: "If it's large enough to enter, has limited entry/egress, isn't designed for continuous occupancy, AND has any hazard (atmospheric, engulfment, mechanical) — it's permit-required under 1910.146. Most lift stations and backflow vaults qualify. A permit requires atmospheric testing, attendant, rescue plan, and written entry procedure.",
      },
    ],
    small_shop_facts:
      "65% of plumbing citations since 2024 went to contractors with fewer than 20 workers — median penalty $19,800, top cases above $132K",
    close_subpart: "29 CFR 1926 Subpart P",
  },

  cta: {
    eyebrow: "PLUMBING · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "plumbing contractors",
    pills: [
      "4-min assessment",
      "Plumbing citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
