import type { TradeLandingConfig } from "../types"

/**
 * Framing — federal OSHA trade landing page config.
 *
 * Testimonials pulled from scraper DB vizmtkfpxxjzlpzibate — top-200
 * high-penalty federal OSHA cases, filtered to NAICS 238130 (Framing
 * Contractors). 12 NAICS-matched cases in sample, 10 willful + 2 repeat.
 * Subpart M (Fall Protection) drives 100% of the high-penalty framing sample.
 */
export const framingConfig: TradeLandingConfig = {
  slug: "framing",

  meta: {
    title: "Free Framing Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. Framing-specific gap analysis based on real federal enforcement data. 4 minutes. No email until you see your score.",
  },

  header: {
    trade_title: "Framing",
    naics: "238130 (Framing Contractors)",
    stats_line:
      "$88.89M federal penalties · 28,920 framing contractors cited · 302 willful + 3,087 repeat · full scraper enforcement DB",
    top_cites:
      "1926.501(b)(13) fall protection, 1926.451 scaffolds, 1926.1053 ladders",
  },

  hero: {
    eyebrow: "FRAMING · FEDERAL OSHA",
    h1: ["Federal OSHA fined", "framing contractors", "$88.9 million to date."],
    h1_crimson_accent: "$88.9 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which fall-protection citation an inspector would hang on your framing crew. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "Framing-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 5 framing-specific gaps",
      fine_range: "$48,393 – $145,832",
      gaps: [
        "No written fall protection plan",
        "No scaffold inspection log",
        "Missing ladder safety program",
        "Heat illness plan absent",
      ],
    },
  },

  agg: [
    { n: 88_886_831, prefix: "$", suffix: "", label: "Federal penalties · framing · enforcement-DB total" },
    { n: 28_920, prefix: "", suffix: "", label: "Framing contractors cited" },
    { n: 3_389, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 165_514, prefix: "$", suffix: "", label: "Top willful fall-protection penalty (statutory max)" },
  ],

  transformation: {
    h2: ["Framing compliance", "without the binder."],
    lede_qualifier: "framing-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1926 section your framing work is held against.",
    step02_trade_plural: "framing contractors",
  },

  benefits: {
    subpart: "29 CFR 1926 Subpart M + Subpart L + Subpart X",
    risk_range: "$15K–$145K",
    specialty_card_title: "Framing-specific intelligence",
    specialty_card_desc:
      "Fall protection dominates framing citations. We surface the 6-foot trigger on floor openings, the 10-foot scaffold guardrail rule, and the ladder-pitch tests OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "framing contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$165,514",
    hook_desc:
      "federal statutory max for a willful fall-protection citation — 302 such citations issued against framing contractors in the scraper enforcement DB",
    testimonials: [
      {
        quote:
          "Willful fall-protection citation. Two framers exposed on a second-story deck, no guardrails, no personal fall arrest.",
        penalty: "$165,514 penalty",
        attribution: "Hernandez Remodeling & Construction, Inc. · Addison, TX · Dec 2024",
        violation_tag: "Willful fall protection · 1926.501",
      },
      {
        quote:
          "Willful fall-protection citation. Carpenter framing roof trusses above 6 feet, no conventional protection, no written plan.",
        penalty: "$165,514 penalty",
        attribution: "Colossus Contracting Group LLC · Parrish, FL · Jun 2025",
        violation_tag: "Willful fall protection · 1926.501",
      },
      {
        quote:
          "Willful fall-protection citation. Framer working at leading edge above 6 feet. Crew uniform, no documented safety program.",
        penalty: "$161,323 penalty",
        attribution: "Adrian Construction Group LLC · Franklin Lakes, NJ · Jul 2023",
        violation_tag: "Willful fall protection · 1926.501",
      },
    ],
  },

  compare: {
    rows: [
      { label: "Written fall protection plan", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Scaffold + ladder inspection logs", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Subpart M + L citation mapping", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic crew training reminders", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$15K–$145K",
    risk_range_diy: "$5K–$80K",
  },

  faq: {
    trade_specific: [
      {
        q: "Does 1926.501 apply if we're only framing residential?",
        a: "Yes. The interim enforcement policy that carved out residential work was withdrawn in 2011. Every framing employer is held to Subpart M at 6 feet — conventional fall protection unless a written plan documents infeasibility. Protekon's assessment checks the plan, not just the practice.",
      },
      {
        q: "How do scaffold guardrails apply to frame construction?",
        a: "1926.451 requires guardrails or personal fall arrest on scaffolds above 10 feet. Frame-stage work rarely meets either without active planning. The #1 citation we see: no documented pre-shift or 90-day scaffold inspection. Protekon generates the inspection log automatically.",
      },
    ],
    small_shop_facts:
      "67% of framing citations since 2024 went to contractors with fewer than 25 workers — median penalty $21,100, top cases above $145K",
    close_subpart: "29 CFR 1926 Subpart M",
  },

  cta: {
    eyebrow: "FRAMING · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OSHA does.", "Four minutes."],
    lede_trade_plural: "framing contractors",
    pills: [
      "4-min assessment",
      "Framing citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
