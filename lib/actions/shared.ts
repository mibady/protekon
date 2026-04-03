"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Shared auth helper for server actions.
 * Returns the Supabase client and the authenticated user's ID.
 */
export async function getAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}
