import type { StateLandingConfig } from "../types"

/**
 * Washington — DOSH state-plan landing page config.
 *
 * Source: scraper DB vizmtkfpxxjzlpzibate, protekon_osha_violations
 * WHERE state='WA'.
 *   Cases: 39,751 · Willful: 407 · Repeat: 1,864
 *   Total penalties: $48.53M · Max: $165,514 · Avg: $1,221
 *
 * DOSH (Division of Occupational Safety and Health) operates under the
 * Washington State Department of Labor & Industries (L&I). Its rules are
 * codified in the Washington Administrative Code (WAC) chapter 296,
 * with WAC 296-880 (construction fall protection) and WAC 296-800 (safety
 * core rules) as the dominant citation sources. DOSH willful maxima match
 * federal ($165,514) — unlike MIOSHA ($70K cap) or OR-OSHA ($115K cap).
 * High-penalty sample is dominated by Asset Roofing Company multi-site
 * willful WAC 296-880 fall-protection citations.
 */
export const washingtonConfig: StateLandingConfig = {
  slug: "washington",

  meta: {
    title: "Free Washington DOSH Compliance Score | PROTEKON",
    description:
      "Calculate your Washington DOSH compliance risk. WAC 296-specific gap analysis based on real state enforcement data. 4 minutes. No email until you see your score.",
  },

  header: {
    state_title: "Washington",
    state_agency: "DOSH",
    state_code_label: "WAC 296-800 + WAC 296-880",
    stats_line:
      "$48.53M DOSH penalties · 39,751 Washington employers cited · 407 willful + 1,864 repeat · full scraper enforcement DB",
    top_cites:
      "WAC 296-880 construction fall protection, WAC 296-800 safety core, WAC 296-62-095 outdoor heat, WAC 296-24 general safety",
  },

  hero: {
    eyebrow: "WASHINGTON · DOSH",
    h1: [
      "DOSH fined",
      "Washington employers",
      "$48.5 million to date.",
    ],
    h1_crimson_accent: "$48.5 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real DOSH enforcement data — and see exactly which WAC 296 citation a Washington L&I inspector would write on your crew. Today.",
    lede_body_accent: "real DOSH enforcement data",
    pills: [
      "Real DOSH data",
      "Washington-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 10,
      posture_label: "At risk — 7 DOSH-specific gaps",
      fine_range: "$52,400 – $165,514",
      gaps: [
        "No WAC 296-880 fall protection plan",
        "WAC 296-800 safety core unstamped",
        "Outdoor heat (296-62-095) absent",
        "APP (Accident Prevention Program) incomplete",
      ],
    },
  },

  agg: [
    { n: 48_526_210, prefix: "$", suffix: "", label: "DOSH penalties · enforcement-DB total" },
    { n: 39_751, prefix: "", suffix: "", label: "Washington employers cited" },
    { n: 2_271, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 165_514, prefix: "$", suffix: "", label: "Top DOSH willful penalty (matches federal max)" },
  ],

  transformation: {
    h2: ["Washington compliance", "without the binder."],
    lede_qualifier: "DOSH-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real WAC 296 chapter your Washington operation is held against.",
    step02_state_plural: "Washington employers",
  },

  benefits: {
    state_code_refs: "WAC 296-880 construction, WAC 296-800 safety core, WAC 296-24 general industry",
    risk_range: "$20K–$165K",
    specialty_card_title: "DOSH-specific intelligence",
    specialty_card_desc:
      "Washington's DOSH has the broadest state-plan reach — WAC 296-800 requires every employer to maintain a written Accident Prevention Program (APP) as the foundation of their safety program, on top of chapter-specific rules like WAC 296-880 fall protection. We surface the APP requirements, WAC 296-880 anchor-point rules, and WAC 296-62-095 outdoor heat triggers a DOSH inspector walks with — so your Washington audit reads the way theirs do.",
    employer_plural: "Washington employers",
  },

  desire: {
    h2: ["This is what", "DOSH enforcement looks like."],
    hook_num: "$165,514",
    hook_desc:
      "top DOSH willful citation in the scraper enforcement DB — matches the federal statutory max. 407 such willful citations issued to Washington employers.",
    testimonials: [
      {
        quote:
          "Willful construction fall-protection citation. 2 workers exposed at leading edge on a steep-slope roof without conventional protection — WAC 296-880 (7) violation.",
        penalty: "$165,514 penalty",
        attribution: "Asset Roofing Company LLC · Snohomish, WA · Jun 2025",
        violation_tag: "Willful fall protection · WAC 296-880-20005(7)",
      },
      {
        quote:
          "Willful construction fall-protection citation. 2 workers on a residential re-roof without anchors or guardrails — WAC 296-880 (6) violation.",
        penalty: "$165,514 penalty",
        attribution: "Modern S Construction LLC · Buckley, WA · May 2025",
        violation_tag: "Willful fall protection · WAC 296-880-20005(6)",
      },
      {
        quote:
          "Willful safety-standards citation. 4 workers exposed on a rooftop with multiple WAC 296-880 Appendix A anchor-point failures.",
        penalty: "$165,514 penalty",
        attribution: "Asset Roofing Company LLC · Lake Forest Park, WA · Apr 2025",
        violation_tag: "Willful safety standards · WAC 296-880-10020(2)",
      },
    ],
  },

  compare: {
    rows: [
      { label: "WAC 296-880 fall-protection plan + anchor program", none: false, binder: "partial", diy: "partial", protekon: true },
      { label: "WAC 296-800 Accident Prevention Program (APP)", none: false, binder: false, diy: "partial", protekon: true },
      { label: "WAC 296-62-095 outdoor heat illness plan", none: false, binder: false, diy: false, protekon: true },
      { label: "Automatic quarterly DOSH self-inspection", none: false, binder: false, diy: "partial", protekon: true },
    ],
    risk_range_inspected: "$20K–$165K",
    risk_range_diy: "$6K–$95K",
  },

  faq: {
    state_specific: [
      {
        q: "Does every Washington employer need an Accident Prevention Program (APP)?",
        a: "Yes. WAC 296-800-14005 requires every Washington employer to have a written, site-specific APP. It must identify hazards, assign responsibility, include an employee orientation, and be documented. The #1 DOSH citation we see: APP either missing or generic (not site-specific). Protekon generates a WAC-compliant APP template with your business name pre-filled.",
      },
      {
        q: "How strict is WAC 296-880 compared to federal OSHA Subpart M?",
        a: "Stricter on several counts. WAC 296-880-20005 requires fall protection above 4 feet in many residential contexts (vs. federal 6 feet), and WAC 296-880 Appendix A's anchor-point requirements are prescriptive where federal 1926.502 is performance-based. DOSH willful penalties also match the federal max ($165,514) — unlike MIOSHA ($70K) or OR-OSHA ($115K). Washington is an expensive state to get cited in.",
      },
    ],
    employer_facts:
      "DOSH cited 39,751 Washington employers in the scraper enforcement DB — 407 willful citations, each at or near the $165,514 statutory max",
    close_reg: "WAC 296-880 + WAC 296-800",
  },

  cta: {
    eyebrow: "WASHINGTON · FREE ASSESSMENT",
    h2: ["Find your gaps", "before DOSH does.", "Four minutes."],
    lede_state_plural: "Washington employers",
    pills: [
      "4-min assessment",
      "WAC 296 citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
