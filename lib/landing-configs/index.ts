import type { TradeLandingConfig } from "./types"
import { roofingConfig } from "./trades/roofing"
import { framingConfig } from "./trades/framing"
import { electricalConfig } from "./trades/electrical"
import { plumbingConfig } from "./trades/plumbing"
import { hvacConfig } from "./trades/hvac"
import { concreteConfig } from "./trades/concrete"
import { masonryConfig } from "./trades/masonry"
import { gcConfig } from "./trades/gc"

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

export function getTradeConfig(slug: string): TradeLandingConfig | null {
  return TRADE_CONFIGS[slug] ?? null
}

export function listTradeSlugs(): string[] {
  return Object.keys(TRADE_CONFIGS)
}

export function getAllTradeConfigs(): TradeLandingConfig[] {
  return Object.values(TRADE_CONFIGS)
}

export type { TradeLandingConfig } from "./types"
