import type { ReactNode } from "react"

/**
 * TradeLandingConfig — editorial content contract for one trade landing page.
 *
 * The page template at components/score/landing/TradeLanding.tsx consumes this
 * shape. The scoring engine (Layer 1) is untouched; landing pages only deep-link
 * into the wizard via `/score?start=true&industry=<slug>`.
 *
 * Configs live in git under lib/landing-configs/trades/*.ts — never in Supabase.
 * Editorial copy is versioned alongside code with TypeScript shape enforcement.
 */
export interface TradeLandingConfig {
  /** URL slug. Must match folder/route segment AND a verticals.slug row. */
  slug: string

  meta: {
    title: string
    description: string
    canonical?: string
  }

  /** Data-provenance banner above the hero. */
  header: {
    trade_title: string
    naics: string
    stats_line: string
    top_cites: string
  }

  hero: {
    eyebrow: string
    /** Three stacked lines. Line 3 typically contains the crimson-accented phrase. */
    h1: [string, string, string]
    /** Optional phrase in h1 that renders crimson (e.g. "$145,191", "$164 million"). */
    h1_crimson_accent?: string
    /** Uppercase subhead under h1, e.g. "How much of that is yours?" */
    subhead_uppercase: string
    /** Body paragraph below the subhead. */
    lede_body: string
    /** Bolded phrase inside lede_body — template wraps it in <strong>. */
    lede_body_accent: string
    /** 4 trust-line pills below CTA buttons. */
    pills: [string, string, string, string]
    /** Right-side "sample score report" card. */
    scorecard: {
      score: number
      denom: number
      posture_label: string
      fine_range: string
      gaps: [string, string, string, string]
    }
  }

  /** 4 CountUp stats in the stat stripe. */
  agg: Array<{
    n: number
    prefix: string
    suffix: string
    label: string
  }>

  transformation: {
    h2: [string, string]
    lede_qualifier: string
    step01_desc: string
    step02_trade_plural: string
  }

  benefits: {
    subpart: string
    risk_range: string
    specialty_card_title: string
    specialty_card_desc: string
    trade_plural: string
  }

  desire: {
    h2: [string, string]
    hook_num: string
    hook_desc: ReactNode
    testimonials: [Testimonial, Testimonial, Testimonial]
  }

  compare: {
    rows: [CompareRow, CompareRow, CompareRow, CompareRow]
    risk_range_inspected: string
    risk_range_diy: string
  }

  faq: {
    trade_specific: [FaqEntry, FaqEntry]
    small_shop_facts: string
    close_subpart: string
  }

  cta: {
    eyebrow: string
    h2: [string, string, string]
    lede_trade_plural: string
    pills: [string, string, string, string]
  }
}

/**
 * StateLandingConfig — editorial content contract for one state-plan landing page.
 *
 * Mirrors TradeLandingConfig but scoped to a state-plan jurisdiction (MIOSHA,
 * OR-OSHA, DOSH, etc.) instead of a trade NAICS. Consumed by
 * components/score/landing/StateLanding.tsx.
 *
 * California is NOT driven by this config — it remains its own special-case
 * page (app/score/california/page.tsx) because its SB 553 / Cal/OSHA framing
 * predates the template and includes bespoke sections.
 */
export interface StateLandingConfig {
  /** URL slug. e.g. "michigan", "oregon", "washington". */
  slug: string

  meta: {
    title: string
    description: string
    canonical?: string
  }

  /** Data-provenance banner above the hero. */
  header: {
    state_title: string                   // "Michigan"
    state_agency: string                  // "MIOSHA" / "OR-OSHA" / "DOSH"
    state_code_label: string              // "Michigan Part 408" / "OAR 437" / "WAC 296"
    stats_line: string
    top_cites: string
  }

  hero: {
    eyebrow: string
    h1: [string, string, string]
    h1_crimson_accent?: string
    subhead_uppercase: string
    lede_body: string
    lede_body_accent: string
    pills: [string, string, string, string]
    scorecard: {
      score: number
      denom: number
      posture_label: string
      fine_range: string
      gaps: [string, string, string, string]
    }
  }

  agg: Array<{
    n: number
    prefix: string
    suffix: string
    label: string
  }>

  transformation: {
    h2: [string, string]
    lede_qualifier: string                // "Michigan-specific", "Oregon-specific", "Washington-specific"
    step01_desc: string
    step02_state_plural: string           // "Michigan employers", "Oregon contractors"
  }

  benefits: {
    state_code_refs: string               // "Part 408, Part 11, Part 490"
    risk_range: string
    specialty_card_title: string
    specialty_card_desc: string
    employer_plural: string               // "Michigan employers"
  }

  desire: {
    h2: [string, string]
    hook_num: string
    hook_desc: ReactNode
    testimonials: [Testimonial, Testimonial, Testimonial]
  }

  compare: {
    rows: [CompareRow, CompareRow, CompareRow, CompareRow]
    risk_range_inspected: string
    risk_range_diy: string
  }

  faq: {
    state_specific: [FaqEntry, FaqEntry]
    employer_facts: string
    close_reg: string                     // "MIOSHA Part 11" / "OR-OSHA OAR 437-003" / "DOSH WAC 296-880"
  }

  cta: {
    eyebrow: string
    h2: [string, string, string]
    lede_state_plural: string             // "Michigan employers"
    pills: [string, string, string, string]
  }
}

export interface Testimonial {
  quote: string
  penalty: string
  attribution: string
  violation_tag: string
}

/**
 * Compare table cell — true = check mark, false = X, "partial" = dash icon.
 * Column order in the template: No plan / Dusty binder / DIY / Protekon.
 */
export interface CompareRow {
  label: string
  none: boolean | "partial"
  binder: boolean | "partial"
  diy: boolean | "partial"
  protekon: boolean | "partial"
}

export interface FaqEntry {
  q: string
  a: string
}
