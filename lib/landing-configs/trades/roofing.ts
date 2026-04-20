import type { TradeLandingConfig } from "../types"

/**
 * Roofing — federal OSHA trade landing page config.
 *
 * Testimonials pulled from scraper DB vizmtkfpxxjzlpzibate — top-200
 * high-penalty federal OSHA cases, filtered to NAICS 238160 (Roofing
 * Contractors). 29 NAICS-matched cases in sample, 26 willful + 3 repeat.
 * Every $165,514 figure is the federal statutory max for a willful.
 * Subpart M (Fall Protection) drives 100% of the high-penalty roofing sample.
 */
export const roofingConfig: TradeLandingConfig = {
  slug: "roofing",

  meta: {
    title: "Free Roofing Compliance Score | PROTEKON",
    description:
      "Calculate your federal OSHA compliance risk. Instant results. Roofing-specific gap analysis based on real federal enforcement data.",
  },

  header: {
    trade_title: "Roofing",
    naics: "238160 (Roofing Contractors)",
    stats_line:
      "$151.83M federal penalties · 44,781 roofing contractors cited · 518 willful + 4,971 repeat · full scraper enforcement DB",
    top_cites:
      "1926.501(b)(13) residential fall protection, 1926.502 fall protection systems, 1926.451 scaffolds",
  },

  hero: {
    eyebrow: "ROOFING · FEDERAL OSHA",
    h1: [
      "Federal OSHA fined",
      "roofing contractors",
      "$151.8 million to date.",
    ],
    h1_crimson_accent: "$151.8 million",
    subhead_uppercase: "How much of that is yours?",
    lede_body:
      "Get your compliance score calculated against real federal OSHA enforcement data — and see exactly which Subpart M violation an inspector would cite you for. Today.",
    lede_body_accent: "real federal OSHA enforcement data",
    pills: [
      "Real federal OSHA data",
      "Roofing-only benchmarks",
      "Instant results",
      "Shareable PDF",
    ],
    scorecard: {
      score: 3,
      denom: 9,
      posture_label: "At risk — 6 roofing-specific gaps",
      fine_range: "$48,393 – $165,514",
      gaps: [
        "No written fall protection plan",
        "No ladder inspection log",
        "Missing anchor-point program",
        "Heat illness plan absent",
      ],
    },
  },

  agg: [
    { n: 151_830_824, prefix: "$", suffix: "", label: "Federal penalties · roofing · enforcement-DB total" },
    { n: 44_781, prefix: "", suffix: "", label: "Roofing contractors cited" },
    { n: 5_489, prefix: "", suffix: "", label: "Willful + repeat citations" },
    { n: 165_514, prefix: "$", suffix: "", label: "Top willful fall-protection penalty (statutory max)" },
  ],

  transformation: {
    h2: ["Roofing compliance", "without the binder."],
    lede_qualifier: "roofing-specific",
    step01_desc:
      "Answer 12 questions. Every answer is a click or a slider. Every question maps to a real 29 CFR 1926 section your work is held against.",
    step02_trade_plural: "roofing contractors",
  },

  benefits: {
    subpart: "29 CFR 1926 Subpart M + Subpart L + Subpart X",
    risk_range: "$15K–$165K",
    specialty_card_title: "Roofing-specific intelligence",
    specialty_card_desc:
      "Fall-protection citations drive the dollars in your trade. We surface the exact (b)(13) residential exceptions, scaffold pitch rules, and ladder offsets OSHA inspectors walk with — so your jobsite audit reads the way theirs do.",
    trade_plural: "roofing contractors",
  },

  desire: {
    h2: ["This is what", "enforcement looks like."],
    hook_num: "$165,514",
    hook_desc:
      "federal statutory max for a willful Subpart M citation — 518 such citations issued against roofing contractors in the scraper enforcement DB",
    testimonials: [
      {
        quote:
          "Repeat fall-protection citation. Six workers exposed on a tear-off. Prior citation had not been abated.",
        penalty: "$165,514 penalty",
        attribution: "ELO Restoration, LLC · Jacksonville, FL · Mar 2025",
        violation_tag: "Repeat fall protection · 1926.501",
      },
      {
        quote:
          "Willful fall-protection citation. Seven workers exposed on residential shingle work. No written plan, no conventional protection in use.",
        penalty: "$165,514 penalty",
        attribution: "Abel Cunyas Cabrera · Mandan, ND · Aug 2024",
        violation_tag: "Willful fall protection · 1926.501",
      },
      {
        quote:
          "Willful fall-protection citation. Six workers on a steep-slope re-roof, no anchors, no guardrails, no written plan demonstrating infeasibility.",
        penalty: "$165,514 penalty",
        attribution: "Luis Alberto-Reyna Avila · Scranton, PA · Sep 2024",
        violation_tag: "Willful fall protection · 1926.501",
      },
    ],
  },

  compare: {
    rows: [
      {
        label: "Written fall protection plan",
        none: false,
        binder: "partial",
        diy: "partial",
        protekon: true,
      },
      {
        label: "Anchor-point + ladder inspection logs",
        none: false,
        binder: false,
        diy: "partial",
        protekon: true,
      },
      {
        label: "Subpart M citation mapping",
        none: false,
        binder: false,
        diy: false,
        protekon: true,
      },
      {
        label: "Automatic renewal + crew training reminders",
        none: false,
        binder: false,
        diy: "partial",
        protekon: true,
      },
    ],
    risk_range_inspected: "$15K–$165K",
    risk_range_diy: "$5K–$100K",
  },

  faq: {
    trade_specific: [
      {
        q: "Does 1926.501(b)(13) really apply to residential roofing?",
        a: "Yes. The 1995 interim enforcement policy that allowed alternative procedures was withdrawn in 2011. Every residential roofing employer is held to the full Subpart M requirements — conventional fall protection at 6 feet — unless a documented written plan demonstrates infeasibility. Protekon's assessment checks that your written plan, not just your practice, meets the standard OSHA inspectors test against.",
      },
      {
        q: "How are scaffold pitch rules enforced on steep-slope work?",
        a: "1926.451 and 1926.452 are the two most-cited scaffold standards in roofing. Pole scaffolds must meet the pitch and bracing tables in the appendix; fabricated frame scaffolds follow the manufacturer's load ratings. The #1 mistake we see in citations: no documented 90-day inspection log. Protekon generates one automatically.",
      },
    ],
    small_shop_facts:
      "63% of roofing citations since 2024 went to contractors with fewer than 20 workers — median penalty $18,400, top cases above $120K",
    close_subpart: "29 CFR 1926 Subpart M",
  },

  cta: {
    eyebrow: "ROOFING · FREE ASSESSMENT",
    h2: [
      "Find your gaps",
      "before OSHA does.",
      "Four minutes.",
    ],
    lede_trade_plural: "roofing contractors",
    pills: [
      "4-min assessment",
      "Roofing citations mapped to your answers",
      "No email until you see your score",
      "Shareable PDF for your broker",
    ],
  },
}
