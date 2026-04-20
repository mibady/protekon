import type { StateLandingConfig } from "../types"

/**
 * Oregon — OR-OSHA state-plan landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, protekon_osha_violations
 * WHERE state='OR'.
 *   Cases: 17,803 · Willful: 10 · Repeat: 563
 *   Total penalties: $21.77M · Max: $115,280 · Avg: $1,223
 *
 * OR-OSHA (Oregon Occupational Safety and Health Administration) operates
 * under the Oregon Department of Consumer and Business Services. Its rules
 * are codified in the Oregon Administrative Rules (OAR) chapter 437,
 * specifically Division 2 (general industry), Division 3 (construction),
 * and Division 7 (agriculture). High-penalty sample is dominated by
 * OAR 437-003-1501(1) (construction fall protection) and OAR 437-003-0503
 * (general construction safety) — roofing contractors drive the dollars.
 */
export const oregonConfig: StateLandingConfig = {
  slug: "oregon",

  meta: {
    title: "Free Oregon OR-OSHA Compliance Score | PROTEKON",
    description:
      "Calculate your OR-OSHA compliance risk. Oregon-specific gap analysis based on real state enforcement data. 4 minutes. No email until you see your score.",
  },

  header: {
    state_title: "Oregon",
    state_agency: "OR-OSHA",
    state_code_label: "OAR 437 Division 2 + Division 3",
    stats_line:
      "$21.77M OR-OSHA penalties · 17,803 Oregon employers cited · 10 willful + 563 repeat · full scraper enforcement DB",
    top_cites:
      "OAR 437-003-1501 construction fall protection, OAR 437-002-0156 outdoor heat, OAR 437-002-0157 wildfire smoke",
  },

  hero: {
    eyebrow: "OREGON · OR-OSHA",
    h1: [
      "OR-OSHA fined",
      "Oregon employers",
      "$21.8 million to date.",
    ],
    h1_crimson_accent: "$21.8 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real OR-OSHA enforcement data — and see exactly which OAR 437 citation an Oregon inspector would write on your crew. Today.",
    lede_body_accent: "real OR-OSHA enforcement data",
    pills: [
      "Real OR-OSHA data",
      "Oregon-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 5 OR-OSHA-specific gaps",
      fine_range: "$18,400 – $115,280",
      gaps: [
        "No written fall protection plan",
        "OAR outdoor heat rule not documented",
        "Wildfire smoke response plan absent",
        "Training records incomplete",
      ],
    },
  },

  agg: [
    { n: 21_771_589, prefix: "$", suffix: "", label: "OR-OSHA penalties · enforcement-DB total" },
    { n: 17_803, prefix: "", suffix: "", label: "Oregon employers cited" },
    { n: 573, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 115_280, prefix: "$", suffix: "", label: "Top OR-OSHA repeat citation (America 1st Roofing)" },
  ],

  transformation: {
    h2: ["Oregon compliance", "without the binder."],
    lede_qualifier: "OR-OSHA-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real OAR 437 Division your Oregon operation is held against.",
    step02_state_plural: "Oregon employers",
  },

  benefits: {
    state_code_refs: "OAR 437-003 construction, OAR 437-002 general industry, OAR 437-007 agriculture",
    risk_range: "$8K–$115K",
    specialty_card_title: "OR-OSHA-specific intelligence",
    specialty_card_desc:
      "Oregon leads the nation on outdoor-work rules — OAR 437-002-0156 (heat illness) and OAR 437-002-0157 (wildfire smoke) are stricter than federal OSHA. We surface those state-specific requirements alongside OAR 437-003 construction rules and the Division 2 general industry checklist an Oregon inspector walks with — so your Oregon audit reads the way theirs do.",
    employer_plural: "Oregon employers",
  },

  desire: {
    h2: ["This is what", "OR-OSHA enforcement looks like."],
    hook_num: "$115,280",
    hook_desc:
      "top OR-OSHA repeat citation in the scraper enforcement DB — Oregon roofing contractor, multiple OAR 437-003-1501(1) failures",
    testimonials: [
      {
        quote:
          "Repeat construction fall-protection citation. Crew on a residential re-roof without conventional fall protection — same violation as a prior inspection, not abated.",
        penalty: "$115,280 penalty",
        attribution: "America 1st Roofing & Builders Inc · Estacada, OR · Sep 2024",
        violation_tag: "Repeat fall protection · OAR 437-003-1501(1)",
      },
      {
        quote:
          "Repeat construction fall-protection citation. Worker at leading edge on a steep-slope residential job — no anchors, no personal fall arrest.",
        penalty: "$113,852 penalty",
        attribution: "New Exteriors LLC · Lake Oswego, OR · Jan 2026",
        violation_tag: "Repeat fall protection · OAR 437-003-1501(1)",
      },
      {
        quote:
          "Repeat construction safety citation under OAR 437-003-0503. 2 workers exposed on a multi-story framing job without general-safety program.",
        penalty: "$103,438 penalty",
        attribution: "Rico Construction Co · Tigard, OR · May 2024",
        violation_tag: "Repeat construction safety · OAR 437-003-0503(1)(A)",
      },
    ],
  },

  compare: {
    rows: [
      { label: "OAR 437-003 construction fall-protection plan", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "OAR 437-002-0156 outdoor heat illness program", none: false, binder: false, diy: "partial", protekon: true },
      { label: "OAR 437-002-0157 wildfire smoke response plan", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic annual OR-OSHA audit prep", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$8K–$115K",
    risk_range_diy: "$3K–$60K",
  },

  faq: {
    state_specific: [
      {
        q: "Does OR-OSHA run stricter rules than federal OSHA?",
        a: "Yes. Oregon is a state-plan state with broader authority than federal OSHA on outdoor work. OAR 437-002-0156 (heat illness at 80°F) and OAR 437-002-0157 (wildfire smoke response at AQI 101+) are landmark state-plan rules with no federal counterpart. OR-OSHA also enforces its own OAR 437 Division 3 construction rules — federal-OSHA compliance alone is NOT a defense in Oregon.",
      },
      {
        q: "What's the most-cited OR-OSHA rule on a roofing job?",
        a: "OAR 437-003-1501(1) — Oregon's construction fall protection trigger at 10 feet (stricter than federal 6-foot-plus-residential-alternative-procedures carveout). Every willful/repeat citation in our sample for roofing contractors was this exact rule. Protekon's template pairs the written plan with the daily pre-work inspection required under Division 3.",
      },
    ],
    employer_facts:
      "OR-OSHA cited 17,803 Oregon employers in the scraper enforcement DB — median penalty $1,223, top cases above $115,000",
    close_reg: "OAR 437 Division 3",
  },

  cta: {
    eyebrow: "OREGON · FREE ASSESSMENT",
    h2: ["Find your gaps", "before OR-OSHA does.", "Four minutes."],
    lede_state_plural: "Oregon employers",
    pills: [
      "4-min assessment",
      "OR-OSHA citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
