import type { TradeLandingConfig } from "../types"

/**
 * Roofing — federal OSHA trade landing page config.
 *
 * Source: protekon_content_stats (scraper DB vizmtkfpxxjzlpzibate)
 *   SELECT * FROM protekon_content_stats WHERE stat_key = 'roofing_headlines';
 * Key signal: Subpart M (Fall Protection) drives 70%+ of roofing citations.
 * NAICS 238160. Top cites: 1926.501(b)(13), 1926.502, 1926.451.
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
      "$147.8M federal penalties · 9,421 roofing contractors fined · 28,160 violations · Since Jan 2025",
    top_cites:
      "1926.501(b)(13) residential fall protection, 1926.502 fall protection systems, 1926.451 scaffolds",
  },

  hero: {
    eyebrow: "ROOFING · FEDERAL OSHA",
    h1: [
      "Federal OSHA fined",
      "roofing contractors",
      "$147.8 million this year.",
    ],
    h1_crimson_accent: "$147.8 million",
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
    { n: 147_800_000, prefix: "$", suffix: "", label: "Federal penalties · roofing · 2025 YTD" },
    { n: 9_421, prefix: "", suffix: "", label: "Roofing contractors cited" },
    { n: 28_160, prefix: "", suffix: "", label: "Violations issued" },
    { n: 145_191, prefix: "$", suffix: "", label: "Average willful-fall citation" },
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
    hook_num: "$145,191",
    hook_desc:
      "average penalty on a willful Subpart M citation · 2024–2025 federal enforcement actions · roofing NAICS",
    testimonials: [
      {
        quote:
          "No fall-protection training. No anchor point inspections. Crew was seven hours into a tear-off on a 7:12 pitch.",
        penalty: "$165,514 penalty",
        attribution: "Addison, TX · roofing contractor · Dec 2024",
        violation_tag: "Willful fall protection · 1926.501(b)(13)",
      },
      {
        quote:
          "Repeat citation on scaffold guardrails. Two workers, one 16-foot drop. No documented inspection log for the prior 90 days.",
        penalty: "$128,340 penalty",
        attribution: "Jacksonville, FL · roofing contractor · Aug 2024",
        violation_tag: "Repeat scaffold · 1926.451",
      },
      {
        quote:
          "Serious citation following a near-miss on a steep-slope residential. Ladder set at 62° with no tie-off. Heat index 104°F that afternoon.",
        penalty: "$52,410 penalty",
        attribution: "Savannah, GA · roofing contractor · Jul 2025",
        violation_tag: "Serious ladder + heat · 1926.1053 / GDC §5(a)(1)",
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
