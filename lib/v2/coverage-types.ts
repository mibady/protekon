import type { ReactNode } from "react"

/**
 * Canonical types for the Coverage surface (v2).
 *
 * Coverage is the catch-all portal for every kind of thing Protekon tracks
 * on behalf of a client: job sites, crews, credentials, equipment, permits,
 * third parties, inspections, hazardous materials, and OSHA findings.
 *
 * The data model is split across three concerns:
 *
 *   1. The catalog of resource types (`resource_types` table — seeded,
 *      columns `key / label / description / sort_order`).
 *   2. The per-vertical override matrix (`resource_type_vertical_map` —
 *      226 rows, columns `vertical_slug / resource_type / enabled /
 *      is_primary / label_override / singular_override /
 *      description_override / sort_order`).
 *   3. The client-specific rollups (`v_client_resources` — view that unions
 *      canonical tables with legacy vertical-specific tables and produces
 *      `total_count / attention_count / critical_count / last_updated /
 *      population_state` per `(client, resource_type)`).
 *
 * SCHEMA NOTE (2026-04-16): Earlier revisions of this file defined
 * per-type row shapes via a `ResourceShapes` generic. Prod tables all carry
 * a `vertical_data jsonb` column as the extension point, so typed row shapes
 * provided no guardrail — they only went stale. We now use a loose
 * `ResourceRow = Record<string, any>` and rely on per-config `ColumnDef`
 * accessors to project the handful of columns each surface actually renders.
 */

// ──────────────────────────────────────────────────────────────────────────
// Resource type catalog (matches public.resource_types rows)
// ──────────────────────────────────────────────────────────────────────────

export const RESOURCE_TYPES = [
  "sites",
  "team",
  "credentials",
  "assets",
  "third_parties",
  "inspections",
  "materials",
  "permits",
  "findings",
] as const

export type ResourceType = (typeof RESOURCE_TYPES)[number]

export function isResourceType(value: string): value is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(value)
}

// ──────────────────────────────────────────────────────────────────────────
// Raw row shape — prod tables all extend via vertical_data jsonb
// ──────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResourceRow = Record<string, any>

// ──────────────────────────────────────────────────────────────────────────
// Vertical override — matches public.resource_type_vertical_map columns
// ──────────────────────────────────────────────────────────────────────────

/**
 * Live columns on `resource_type_vertical_map`. `is_primary` was added in
 * migration 044 — prior to that, only `enabled` and the override columns
 * existed. Consumers should treat a missing row as `{ enabled: true,
 * is_primary: false, ...all nulls }` — this preserves backwards compatibility
 * with verticals that haven't been seeded yet.
 */
export type VerticalOverride = {
  enabled: boolean
  is_primary: boolean
  label_override: string | null
  singular_override: string | null
  description_override: string | null
  sort_order: number | null
}

// ──────────────────────────────────────────────────────────────────────────
// Per-row status — determines badge color and attention flags
// ──────────────────────────────────────────────────────────────────────────

/**
 * Status tones used by the UI to pick a badge color. These map directly to
 * Tailwind tokens already in the v2 palette:
 *   critical   → crimson    (blocking — act today)
 *   attention  → gold       (watchlist — act this week)
 *   ok         → steel/fog  (no action required)
 *   unknown    → steel/fog  (data missing — treated visually as ok, but
 *                            surfaces may choose to prompt the user)
 */
export type StatusTone = "critical" | "attention" | "ok" | "unknown"

// ──────────────────────────────────────────────────────────────────────────
// Config shapes — each resource-type module exports one of these
// ──────────────────────────────────────────────────────────────────────────

export type ColumnDef<T = ResourceRow> = {
  key: string
  label: string
  /** Returns the rendered cell value. Kept string-typed to keep lists plain. */
  value: (row: T) => string | null
  /**
   * Optional ReactNode override. When present, the list row renders this
   * instead of the plain string value — lets a column return a link, badge,
   * icon, colored pill, or days-countdown cell. The `value` fn is still
   * called for null-skipping, truncation fallbacks, and search; provide a
   * non-null string alongside any render override to keep the cell visible.
   * Introduced with NGE-474/476/480 and reused by subsequent configs.
   */
  render?: (row: T) => ReactNode | null
  /** When true, column is hidden on narrow layouts. */
  secondary?: boolean
}

export type DetailField = {
  label: string
  value: string | null
  /**
   * Optional ReactNode override. When present, the detail view renders this
   * in place of the plain string value — lets a field return a link, badge,
   * or decorated text. Null-filtering still uses `value`, so provide a
   * non-null string alongside any render override to keep the field visible.
   */
  render?: ReactNode
}

export type DetailSection<T = ResourceRow> = {
  label: string
  /** Markdown-flavored paragraph describing this block in officer voice. */
  render: (row: T) => DetailField[]
}

export type PrimaryAction<T = ResourceRow> = {
  label: string
  /** Href builder — receives the row id. */
  href: (row: T) => string
}

export type ResourceConfig<T = ResourceRow> = {
  type: ResourceType
  /** Default plural label (overrides come from resource_type_vertical_map). */
  defaultLabel: string
  /** Default singular label for detail headings. */
  defaultSingular: string
  /** Default descriptor used on the overview tiles + empty states. */
  defaultDescription: string
  /** List view columns — order matters. */
  columns: ColumnDef<T>[]
  /** Detail view sections. */
  detailSections: DetailSection<T>[]
  /** Per-row status classifier. Must match the v_client_resources CASE bands. */
  statusFn: (row: T) => StatusTone
  /** Primary action button on the detail page. */
  primaryAction?: PrimaryAction<T>
}
