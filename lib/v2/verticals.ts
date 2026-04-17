import { unstable_cache } from "next/cache"
import { createClient } from "@/lib/supabase/server"

/**
 * Returns the canonical list of active vertical slugs + their display names.
 *
 * Source of truth: the `public.verticals` table. Slugs are the stable key
 * used by client rows, resource_type_vertical_map, and every v2 route that
 * needs to render a label. Display names are the human-facing form ("Real
 * estate" rather than "real_estate").
 *
 * Cached for 1 hour — verticals change on the order of monthly, not per
 * request. The cache key is stable ("v2-vertical-slugs") because the query
 * has no parameters. Invalidate manually via revalidateTag('verticals') if
 * we ever need to promote a new vertical mid-cycle.
 */
export const getVerticalSlugs = unstable_cache(
  async (): Promise<Array<{ slug: string; display_name: string }>> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("verticals")
      .select("slug, display_name")
      .eq("status", "active")
      .order("display_name", { ascending: true })

    if (error || !data) return []

    return data.map((row) => ({
      slug: row.slug as string,
      display_name: row.display_name as string,
    }))
  },
  ["v2-vertical-slugs"],
  {
    revalidate: 3600, // 1 hour
    tags: ["verticals"],
  }
)
