import { createClient } from "@/lib/supabase/server"

export type UserRole = 'owner' | 'compliance_manager' | 'field_lead' | 'auditor'

export type ResolvedRole = {
  userId: string
  clientId: string
  role: UserRole
}

export class RoleError extends Error {
  code: 'not_authenticated' | 'no_role' | 'insufficient'
  constructor(code: RoleError['code'], message: string) {
    super(message)
    this.code = code
    this.name = 'RoleError'
  }
}

/**
 * Returns the current user's role for a client. Defaults clientId to auth.uid()
 * (single-user-per-client legacy pattern — owner's user_id IS the client_id).
 */
export async function getUserRole(clientId?: string): Promise<UserRole | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const targetClientId = clientId ?? user.id

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("client_id", targetClientId)
    .not("activated_at", "is", null)
    .is("deactivated_at", null)
    .maybeSingle()

  return (data?.role as UserRole | undefined) ?? null
}

/**
 * Guards server actions. Throws RoleError if the user lacks the required role.
 */
export async function requireRole(allowed: UserRole[]): Promise<ResolvedRole> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new RoleError('not_authenticated', 'Sign in required.')

  const clientId = user.id // single-user-per-client default

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("client_id", clientId)
    .not("activated_at", "is", null)
    .is("deactivated_at", null)
    .maybeSingle()

  const role = data?.role as UserRole | undefined
  if (!role) throw new RoleError('no_role', 'No active role for this client.')
  if (!allowed.includes(role)) {
    throw new RoleError(
      'insufficient',
      `This action requires one of: ${allowed.join(', ')}.`
    )
  }
  return { userId: user.id, clientId, role }
}

/**
 * Lists all clients the current user has an activated role in.
 */
export async function listMyClients(): Promise<
  Array<{ client_id: string; role: UserRole }>
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("user_roles")
    .select("client_id, role")
    .eq("user_id", user.id)
    .not("activated_at", "is", null)
    .is("deactivated_at", null)

  return (data ?? []) as Array<{ client_id: string; role: UserRole }>
}

export async function isOwner(clientId?: string): Promise<boolean> {
  return (await getUserRole(clientId)) === 'owner'
}
