import { createClient } from "@/lib/supabase/server"

/**
 * Shape used by Sidebar to render the indented sub-items under Coverage.
 * Kept flat (slug + label + href) so the client component doesn't need to
 * know anything about the underlying schema.
 */
export type CoverageSubItem = {
  slug: string
  label: string
  href: string
}

/**
 * Returns the primary resource types for a given vertical, in
 * `resource_types.sort_order` order.
 *
 * "Primary" means pinned in the sidebar — see migration 044. Non-primary
 * enabled types live in the "All coverage" expander on the overview page
 * and do NOT appear in the sidebar.
 *
 * Called from the v2 layout; the result is plumbed through to Sidebar via
 * props so the client component stays dumb.
 */
export async function coverageSubItemsFor(
  vertical: string
): Promise<CoverageSubItem[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("resource_type_vertical_map")
    .select(
      `resource_type,
       label_override,
       singular_override,
       is_primary,
       resource_types!inner(label, sort_order)`
    )
    .eq("vertical_slug", vertical)
    .eq("enabled", true)
    .eq("is_primary", true)
    .order("resource_types(sort_order)", { ascending: true })

  if (!data) return []

  return data.map((row) => {
    // resource_types comes back as either an object or an array depending on
    // PostgREST relationship cardinality. Normalize to the single-object form
    // — the !inner hint guarantees there's at least one row.
    const rtRaw = (row as { resource_types: unknown }).resource_types
    const rt = Array.isArray(rtRaw) ? rtRaw[0] : rtRaw
    const rtObj = (rt ?? {}) as { label?: string }

    const slug = (row.resource_type as string) ?? ""
    const override = (row.label_override as string | null) ?? null
    const label = override ?? rtObj.label ?? slug

    return {
      slug,
      label,
      href: `/dashboard/coverage/${slug}`,
    }
  })
}
