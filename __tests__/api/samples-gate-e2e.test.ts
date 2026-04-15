import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest"
import { NextRequest } from "next/server"
import { PDFDocument } from "pdf-lib"
const mockUser = {
  id: "user-123",
  email: "test@co.com",
  user_metadata: {
    business_name: "Test Co",
    vertical: "construction",
    plan: "professional",
  },
}

type UserOrNull = typeof mockUser | null
let currentUser: UserOrNull = mockUser
function setMockUser(u: UserOrNull): void {
  currentUser = u
}
function resetAllMocks(): void {
  vi.clearAllMocks()
  currentUser = mockUser
}

/**
 * End-to-end coverage for /api/samples/gate.
 *
 * The POST endpoint captures a lead (no PDF). The GET endpoint delivers the
 * sample PDF — either directly for authenticated dashboard users, or after a
 * recent lead row exists for the supplied email.
 *
 * This test exercises every known sample key (7 long-form report titles + 3
 * employee sampleKeys + 3 employee title aliases) across three paths:
 *   (a) authenticated user bypass  -> GET returns 200 + PDF
 *   (b) email-gate happy path      -> POST lead, then GET ?email= returns PDF
 *   (c) invalid sample key         -> 400 "Unknown report type"
 *
 * Every PDF buffer is validated with `%PDF-` magic bytes, a ≥2KB size floor,
 * and a round-trip `PDFDocument.load()` using pdf-lib.
 */

// --- Mocks ------------------------------------------------------------------

// Mock @/lib/supabase/server — GET handler calls createClient() then
// auth.getUser() to detect an authenticated dashboard user.
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: currentUser },
        error: currentUser ? null : { message: "Not authenticated" },
      })),
    },
  })),
}))

// Mock @/lib/supabase/admin with a SELECT chain that includes
// `ilike` / `gte` / `limit` / `maybeSingle` — the shared helper's chainable
// methods don't include `ilike`, but the route uses it for email lookup.
let adminLeadRow: { id: string } | null = { id: "lead-1" }
let adminInsertError: { message: string } | null = null

export function setAdminLeadRow(row: { id: string } | null): void {
  adminLeadRow = row
}
export function setAdminInsertError(err: { message: string } | null): void {
  adminInsertError = err
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((_table: string) => {
      const selectChain: Record<string, unknown> = {}
      const terminal = () =>
        Promise.resolve({ data: adminLeadRow, error: null })
      for (const m of ["select", "ilike", "gte", "limit", "eq", "order"]) {
        selectChain[m] = vi.fn(() => selectChain)
      }
      selectChain.single = vi.fn(() => terminal())
      selectChain.maybeSingle = vi.fn(() => terminal())
      selectChain.then = (resolve: (v: unknown) => void) =>
        terminal().then(resolve)

      return {
        select: vi.fn(() => selectChain),
        insert: vi.fn(() =>
          Promise.resolve({ data: null, error: adminInsertError })
        ),
      }
    }),
  })),
}))

// Stub rate-limit so repeated calls from the same synthetic IP never trip the
// in-process limiter (POST path uses rateLimit()).
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ limited: false })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}))

// --- Sample key catalog -----------------------------------------------------

const LONG_TITLE_KEYS: string[] = [
  "SB 553 Workplace Violence Prevention Plan",
  "Construction Subcontractor Compliance Report",
  "Property Management Municipal Compliance Pulse",
  "Injury & Illness Prevention Program (IIPP)",
  "SB 553 Violent Incident Log (Sample)",
  "Audit-Ready Compliance Package",
  "Quarterly Compliance Review",
]

const EMPLOYEE_SAMPLE_KEYS: string[] = [
  "sb-553-employee",
  "signoff-sheet",
  "manager-wvp-guide",
]

const EMPLOYEE_TITLE_ALIASES: string[] = [
  "SB 553 Employee Summary",
  "WVPP Employee Sign-Off Sheet",
  "Manager WVP Communication Guide",
]

const ALL_VALID_KEYS: string[] = [
  ...LONG_TITLE_KEYS,
  ...EMPLOYEE_SAMPLE_KEYS,
  ...EMPLOYEE_TITLE_ALIASES,
]

// --- Helpers ----------------------------------------------------------------

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/samples/gate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(body),
  })
}

function makeGetRequest(params: Record<string, string>): NextRequest {
  const qs = new URLSearchParams(params).toString()
  return new NextRequest(`http://localhost/api/samples/gate${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { "x-forwarded-for": "127.0.0.1" },
  })
}

async function assertPdfResponse(res: Response): Promise<void> {
  expect(res.status).toBe(200)
  expect(res.headers.get("Content-Type")).toBe("application/pdf")
  expect(res.headers.get("Content-Disposition")).toMatch(/attachment; filename=".+\.pdf"/)

  const arrayBuffer = await res.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // Magic bytes
  expect(buffer.byteLength).toBeGreaterThanOrEqual(2048)
  const header = Buffer.from(buffer.slice(0, 5)).toString("ascii")
  expect(header).toBe("%PDF-")

  // pdf-lib round-trip — throws if malformed
  const reparsed = await PDFDocument.load(buffer)
  expect(reparsed.getPageCount()).toBeGreaterThan(0)
}

// --- Tests ------------------------------------------------------------------

describe("samples-gate e2e — all sample keys", () => {
  beforeAll(() => {
    // sample_report_leads reads use maybeSingle(); by default we return a
    // lead row to satisfy the email-gate GET path for authenticated-bypass
    // tests that don't rely on it.
    setAdminLeadRow({ id: "lead-1" })
  })

  beforeEach(() => {
    resetAllMocks()
    vi.resetModules()
    setAdminLeadRow({ id: "lead-1" })
  })

  // ------------- Authenticated user bypass (GET) ---------------------------
  describe("(a) authenticated user bypass", () => {
    beforeEach(() => {
      setMockUser(mockUser)
    })

    for (const key of ALL_VALID_KEYS) {
      it(`GET returns PDF for "${key}"`, async () => {
        const { GET } = await import("@/app/api/samples/gate/route")
        const res = await GET(makeGetRequest({ report: key }))
        await assertPdfResponse(res as unknown as Response)
      })
    }
  })

  // ------------- Email-gate happy path (POST lead, then GET) --------------
  describe("(b) email-gate happy path", () => {
    beforeEach(() => {
      setMockUser(null) // unauthenticated
      setAdminLeadRow({ id: "lead-1" })
    })

    for (const key of ALL_VALID_KEYS) {
      it(`POST lead + GET returns PDF for "${key}"`, async () => {
        const { POST, GET } = await import("@/app/api/samples/gate/route")

        // Step 1: submit the email gate
        const postRes = await POST(
          makePostRequest({
            email: "lead@example.com",
            companyName: "Acme Inc",
            vertical: "construction",
          }) as never
        )
        expect(postRes.status).toBe(200)
        const postJson = await postRes.json()
        expect(postJson.success).toBe(true)

        // Step 2: unauthenticated GET with the gated email should stream the PDF
        const getRes = await GET(
          makeGetRequest({ report: key, email: "lead@example.com" }) as never
        )
        await assertPdfResponse(getRes as unknown as Response)
      })
    }

    it("GET without email returns 403", async () => {
      const { GET } = await import("@/app/api/samples/gate/route")
      const res = await GET(
        makeGetRequest({ report: LONG_TITLE_KEYS[0]! }) as never
      )
      expect(res.status).toBe(403)
    })

    it("GET with unseen email (no lead row) returns 403", async () => {
      setAdminLeadRow(null)
      const { GET } = await import("@/app/api/samples/gate/route")
      const res = await GET(
        makeGetRequest({
          report: LONG_TITLE_KEYS[0]!,
          email: "stranger@example.com",
        }) as never
      )
      expect(res.status).toBe(403)
    })
  })

  // ------------- Invalid sample key ---------------------------------------
  describe("(c) invalid sample key", () => {
    it("authenticated user: unknown report returns 400", async () => {
      setMockUser(mockUser)
      const { GET } = await import("@/app/api/samples/gate/route")
      const res = await GET(
        makeGetRequest({ report: "this-does-not-exist" }) as never
      )
      // Route catches the "Unknown report" throw and returns 400.
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toMatch(/unknown report/i)
    })

    it("email-gated user: unknown report still returns 400", async () => {
      setMockUser(null)
      setAdminLeadRow({ id: "lead-1" })
      const { GET } = await import("@/app/api/samples/gate/route")
      const res = await GET(
        makeGetRequest({
          report: "bogus-key",
          email: "lead@example.com",
        }) as never
      )
      expect(res.status).toBe(400)
    })

    it("missing report parameter returns 400", async () => {
      setMockUser(mockUser)
      const { GET } = await import("@/app/api/samples/gate/route")
      const res = await GET(makeGetRequest({}))
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toMatch(/missing report/i)
    })
  })
})
