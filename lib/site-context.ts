import { cookies } from "next/headers"

export const SITE_COOKIE = "protekon_site_id"

export type SiteContext = { siteId: string | null }

/**
 * Reads the selected-site cookie on the server.
 * Returns `{ siteId: null }` when cookie is absent or set to "all".
 * Every list query and create action uses this to scope by site when
 * a specific location is selected; null means "all sites".
 */
export async function getSiteContext(): Promise<SiteContext> {
  const store = await cookies()
  const raw = store.get(SITE_COOKIE)?.value
  if (!raw || raw === "all") return { siteId: null }
  return { siteId: raw }
}
