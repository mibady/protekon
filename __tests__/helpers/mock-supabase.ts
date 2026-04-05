import { vi } from "vitest"

// Default authenticated user
export const mockUser = {
  id: "user-123",
  email: "test@co.com",
  user_metadata: {
    business_name: "Test Co",
    vertical: "construction",
    plan: "professional",
  },
}

// Track table calls for assertions
export const tableCalls: Record<string, string[]> = {}

function trackTable(table: string, op: string) {
  if (!tableCalls[table]) tableCalls[table] = []
  tableCalls[table].push(op)
}

export function resetTableCalls() {
  for (const key of Object.keys(tableCalls)) delete tableCalls[key]
}

// Configurable responses per table
export const tableResponses: Record<
  string,
  { data?: unknown; error?: unknown; count?: number }
> = {}

export function setTableResponse(
  table: string,
  response: { data?: unknown; error?: unknown; count?: number }
) {
  tableResponses[table] = response
}

function getResponse(table: string) {
  return tableResponses[table] ?? { data: [], error: null }
}

// Chainable query builder mock
function createChain(table: string) {
  const chain: Record<string, unknown> = {}
  const terminal = () => Promise.resolve(getResponse(table))

  // All chainable methods return the chain
  const chainMethods = [
    "select",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "is",
    "not",
    "or",
    "order",
    "limit",
    "range",
    "filter",
    "match",
    "contains",
    "containedBy",
    "overlaps",
    "textSearch",
  ]

  for (const method of chainMethods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }

  // Terminal methods resolve with data
  chain.single = vi.fn().mockImplementation(() => {
    const resp = getResponse(table)
    return Promise.resolve({
      data: Array.isArray(resp.data) ? resp.data[0] ?? null : resp.data,
      error: resp.error ?? null,
    })
  })
  chain.maybeSingle = chain.single
  chain.then = (resolve: (v: unknown) => void) => terminal().then(resolve)
  chain.csv = vi.fn().mockImplementation(terminal)

  return chain
}

// Mock insert/update/delete builders
function createMutationChain(table: string, op: string) {
  trackTable(table, op)
  const chain: Record<string, unknown> = {}
  const terminal = () => Promise.resolve(getResponse(table))

  const chainMethods = ["eq", "neq", "match", "in", "is", "not", "or", "filter", "select"]
  for (const method of chainMethods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  chain.single = vi.fn().mockImplementation(() => {
    const resp = getResponse(table)
    return Promise.resolve({
      data: Array.isArray(resp.data) ? resp.data[0] ?? null : resp.data,
      error: resp.error ?? null,
    })
  })
  chain.then = (resolve: (v: unknown) => void) => terminal().then(resolve)

  return chain
}

// The from() mock
export const mockFrom = vi.fn((table: string) => {
  return {
    select: vi.fn((..._args: unknown[]) => {
      trackTable(table, "select")
      return createChain(table)
    }),
    insert: vi.fn((..._args: unknown[]) => createMutationChain(table, "insert")),
    update: vi.fn((..._args: unknown[]) => createMutationChain(table, "update")),
    upsert: vi.fn((..._args: unknown[]) => createMutationChain(table, "upsert")),
    delete: vi.fn(() => createMutationChain(table, "delete")),
  }
})

// Auth mock (configurable)
let currentUser: typeof mockUser | null = mockUser

export function setMockUser(user: typeof mockUser | null) {
  currentUser = user
}

export const mockAuth = {
  getUser: vi.fn().mockImplementation(() =>
    Promise.resolve({
      data: { user: currentUser },
      error: currentUser ? null : { message: "Not authenticated" },
    })
  ),
  signInWithPassword: vi.fn().mockResolvedValue({
    data: { user: mockUser, session: { access_token: "token" } },
    error: null,
  }),
  signUp: vi.fn().mockResolvedValue({
    data: { user: { ...mockUser, id: "new-user-456" }, session: null },
    error: null,
  }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  updateUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
}

// The complete Supabase client mock
export const mockSupabaseClient = {
  auth: mockAuth,
  from: mockFrom,
}

// Setup mocks for both import patterns
export function setupSupabaseMocks() {
  vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  }))

  vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(() => ({
      auth: mockAuth,
      from: mockFrom,
    })),
  }))

  // Mock the shared getAuth helper (Pattern B)
  vi.mock("@/lib/actions/shared", () => ({
    getAuth: vi.fn().mockImplementation(async () => ({
      supabase: mockSupabaseClient,
      clientId: currentUser?.id ?? null,
    })),
  }))
}

// Reset all mocks between tests
export function resetAllMocks() {
  vi.clearAllMocks()
  resetTableCalls()
  currentUser = mockUser
  for (const key of Object.keys(tableResponses)) delete tableResponses[key]
}
