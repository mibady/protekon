import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Read-only Supabase client for the OSHA scraper database.
 * Used as a fallback when the external OSHA API is not configured.
 *
 * Env vars:
 *   OSHA_SCRAPER_SUPABASE_URL — Scraper project URL (e.g. https://vizmtkfpxxjzlpzibate.supabase.co)
 *   OSHA_SCRAPER_SUPABASE_KEY — Service role key for the scraper project (read-only access)
 */
export function createScraperClient() {
  const url = process.env.OSHA_SCRAPER_SUPABASE_URL
  const key = process.env.OSHA_SCRAPER_SUPABASE_KEY

  if (!url || !key) return null

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  })
}
