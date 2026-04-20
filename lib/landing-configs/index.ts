import type { TradeLandingConfig, StateLandingConfig } from "./types"
import { roofingConfig } from "./trades/roofing"
import { framingConfig } from "./trades/framing"
import { electricalConfig } from "./trades/electrical"
import { plumbingConfig } from "./trades/plumbing"
import { hvacConfig } from "./trades/hvac"
import { concreteConfig } from "./trades/concrete"
import { masonryConfig } from "./trades/masonry"
import { gcConfig } from "./trades/gc"
import { michiganConfig } from "./states/michigan"
import { oregonConfig } from "./states/oregon"
import { washingtonConfig } from "./states/washington"

/**
 * Trade landing config registry.
 *
 * Adding a new trade = write `trades/<slug>.ts` exporting a `TradeLandingConfig`,
 * then register it here. The dynamic route at `app/score/trade/[trade]/page.tsx`
 * picks it up via `generateStaticParams()` at build time.
 *
 * The `verticals` table in Supabase remains the source of truth for SCORING
 * parameters. These configs are editorial LANDING content only.
 */
const TRADE_CONFIGS: Record<string, TradeLandingConfig> = {
  [roofingConfig.slug]: roofingConfig,
  [framingConfig.slug]: framingConfig,
  [electricalConfig.slug]: electricalConfig,
  [plumbingConfig.slug]: plumbingConfig,
  [hvacConfig.slug]: hvacConfig,
  [concreteConfig.slug]: concreteConfig,
  [masonryConfig.slug]: masonryConfig,
  [gcConfig.slug]: gcConfig,
}

/**
 * State-plan landing config registry.
 *
 * Adding a new state-plan jurisdiction = write `states/<slug>.ts` exporting a
 * `StateLandingConfig`, then register it here. The dynamic route at
 * `app/score/state/[state]/page.tsx` picks it up via `generateStaticParams()`.
 *
 * California is NOT in this registry — it remains a first-class special-case
 * page at `app/score/california/page.tsx` with bespoke SB 553 framing.
 */
const STATE_CONFIGS: Record<string, StateLandingConfig> = {
  [michiganConfig.slug]: michiganConfig,
  [oregonConfig.slug]: oregonConfig,
  [washingtonConfig.slug]: washingtonConfig,
}

export function getTradeConfig(slug: string): TradeLandingConfig | null {
  return TRADE_CONFIGS[slug] ?? null
}

export function listTradeSlugs(): string[] {
  return Object.keys(TRADE_CONFIGS)
}

export function getAllTradeConfigs(): TradeLandingConfig[] {
  return Object.values(TRADE_CONFIGS)
}

export function getStateConfig(slug: string): StateLandingConfig | null {
  return STATE_CONFIGS[slug] ?? null
}

export function listStateSlugs(): string[] {
  return Object.keys(STATE_CONFIGS)
}

export function getAllStateConfigs(): StateLandingConfig[] {
  return Object.values(STATE_CONFIGS)
}

export type { TradeLandingConfig, StateLandingConfig } from "./types"
