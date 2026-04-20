import type { StateLandingConfig } from "../types"

/**
 * Michigan — MIOSHA state-plan landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, protekon_osha_violations
 * WHERE state='MI'.
 *   Cases: 27,131 · Willful: 36 · Repeat: 844
 *   Total penalties: $18.92M · Max: $70,000 · Avg: $697
 *
 * MIOSHA (Michigan Occupational Safety and Health Administration) operates
 * under the Michigan Department of Labor and Economic Opportunity. Its rules
 * are codified under Part 1 - Part 491 of the MIOSHA code. Construction
 * falls under Part 11, general industry under Part 408 / Part 24 etc.
 * LOTO (Part 1910.147 adopted by reference) dominates the high-penalty
 * sample — LG Energy and Request Foods top the list with industrial LOTO.
 */
export const michiganConfig: StateLandingConfig = {
  slug: "michigan",

  meta: {
    title: "Free Michigan MIOSHA Compliance Score | PROTEKON",
    description:
      "Calculate your MIOSHA compliance risk. Michigan-specific gap analysis based on real state enforcement data. 4 minutes. No email until you see your score.",
  },

  header: {
    state_title: "Michigan",
    state_agency: "MIOSHA",
    state_code_label: "Michigan Part 11 + Part 408",
    stats_line:
      "$18.92M MIOSHA penalties · 27,131 Michigan employers cited · 36 willful + 844 repeat · full scraper enforcement DB",
    top_cites:
      "Part 408 lockout/tagout, Part 11 construction fall protection, Part 490 confined space, Part 380 noise",
  },

  hero: {
    eyebrow: "MICHIGAN · MIOSHA",
    h1: [
      "MIOSHA fined",
      "Michigan employers",
      "$18.9 million to date.",
    ],
    h1_crimson_accent: "$18.9 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real MIOSHA enforcement data — and see exactly which Part 11 or Part 408 violation a MIOSHA inspector would cite you for. Today.",
    lede_body_accent: "real MIOSHA enforcement data",
    pills: [
      "Real MIOSHA data",
      "Michigan-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 6 MIOSHA-specific gaps",
      fine_range: "$12,500 – $70,000",
      gaps: [
        "No written LOTO procedure",
        "Part 11 fall protection plan missing",
        "Confined space entry program absent",
        "Heat illness plan outdated",
      ],
    },
  },

  agg: [
    { n: 18_922_946, prefix: "$", suffix: "", label: "MIOSHA penalties · enforcement-DB total" },
    { n: 27_131, prefix: "", suffix: "", label: "Michigan employers cited" },
    { n: 880, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 70_000, prefix: "$", suffix: "", label: "Top MIOSHA penalty (statutory max)" },
  ],

  transformation: {
    h2: ["Michigan compliance", "without the binder."],
    lede_qualifier: "MIOSHA-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real MIOSHA Part your Michigan operation is held against.",
    step02_state_plural: "Michigan employers",
  },

  benefits: {
    state_code_refs: "Part 11 construction, Part 408 general industry, Part 490 confined space",
    risk_range: "$5K–$70K",
    specialty_card_title: "MIOSHA-specific intelligence",
    specialty_card_desc:
      "MIOSHA runs its own rulebook — Part 11 construction, Part 408 general industry, Part 490 confined space. Federal-OSHA compliance is NOT a MIOSHA defense. We surface the Part citations and the MIOSHA Form 100 tests a MIOSHA inspector walks with — so your Michigan audit reads the way theirs do.",
    employer_plural: "Michigan employers",
  },

  desire: {
    h2: ["This is what", "MIOSHA enforcement looks like."],
    hook_num: "$70,000",
    hook_desc:
      "top MIOSHA citation in the scraper enforcement DB — the Michigan state-plan statutory max for a willful or repeat violation",
    testimonials: [
      {
        quote:
          "Repeat lockout/tagout citation. 5 workers exposed to energized equipment on a battery-manufacturing line.",
        penalty: "$70,000 penalty",
        attribution: "LG Energy Solution Michigan Inc · Holland, MI · Sep 2025",
        violation_tag: "Repeat LOTO · Part 408 (1910.147)",
      },
      {
        quote:
          "Repeat lockout/tagout citation. 7 workers exposed on a food-processing line without per-equipment procedures.",
        penalty: "$70,000 penalty",
        attribution: "Request Foods Inc · Holland, MI · Jul 2025",
        violation_tag: "Repeat LOTO · Part 408 (1910.147)",
      },
      {
        quote:
          "Willful construction citation under MIOSHA rule 408.43207. Worker on a steep-slope roof-cleaning job without fall protection.",
        penalty: "$70,000 penalty",
        attribution: "Peak Performance Roof Cleaning LLC · Ludington, MI · Jun 2025",
        violation_tag: "Willful fall protection · Part 11 (Rule 43207)",
      },
    ],
  },

  compare: {
    rows: [
      { label: "MIOSHA Part 408 LOTO procedures (per equipment)", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "Part 11 fall protection plan + anchor logs", none: false, binder: false, diy: "partial", protekon: true },
      { label: "Part 490 confined space entry program", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic annual MIOSHA audit prep", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$5K–$70K",
    risk_range_diy: "$2K–$35K",
  },

  faq: {
    state_specific: [
      {
        q: "Does MIOSHA preempt federal OSHA in Michigan?",
        a: "Yes. Michigan is one of 22 state-plan states where MIOSHA has exclusive enforcement over private-sector workplaces. Federal-OSHA compliance is NOT a defense if a MIOSHA inspector finds a Part violation. MIOSHA rules are at least as strict as federal OSHA and often stricter (e.g., Michigan's own Part 380 Noise rule).",
      },
      {
        q: "Does MIOSHA adopt the federal standards, or run its own?",
        a: "Both. Many Parts adopt 29 CFR 1910/1926 by reference (Part 408 adopts 1910.147 LOTO). Others are Michigan-originated with no federal counterpart (Part 380 Noise, Part 490 Confined Space). Protekon's assessment checks BOTH — federal-adopted AND Michigan-specific rules.",
      },
    ],
    employer_facts:
      "MIOSHA cited 27,131 Michigan employers in the scraper enforcement DB — median penalty $697, top cases at the $70,000 statutory max",
    close_reg: "MIOSHA Part 11 + Part 408",
  },

  cta: {
    eyebrow: "MICHIGAN · FREE ASSESSMENT",
    h2: ["Find your gaps", "before MIOSHA does.", "Four minutes."],
    lede_state_plural: "Michigan employers",
    pills: [
      "4-min assessment",
      "MIOSHA citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
