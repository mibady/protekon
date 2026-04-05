import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase (regular client)
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: () => mockSingle(),
          eq: vi.fn(() => ({
            single: () => mockSingle(),
          })),
        })),
      })),
      update: vi.fn((...args: unknown[]) => {
        mockUpdate(...args)
        return { eq: vi.fn().mockReturnValue({ eq: vi.fn() }) }
      }),
      insert: vi.fn((...args: unknown[]) => {
        mockInsert(...args)
        return Promise.resolve({ error: null })
      }),
    })),
  }),
}))

// Mock Supabase admin client
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: () => mockSingle(),
          eq: vi.fn(() => ({
            single: () => mockSingle(),
          })),
        })),
      })),
      update: vi.fn((...args: unknown[]) => {
        mockUpdate(...args)
        return { eq: vi.fn().mockReturnValue({ eq: vi.fn() }) }
      }),
      insert: vi.fn((...args: unknown[]) => {
        mockInsert(...args)
        return Promise.resolve({ error: null })
      }),
    })),
  }),
}))

// Mock Stripe
const mockCheckoutCreate = vi.fn()
const mockPortalCreate = vi.fn()
const mockConstructEvent = vi.fn()
vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn().mockReturnValue({
    checkout: {
      sessions: { create: (...args: unknown[]) => mockCheckoutCreate(...args) },
    },
    billingPortal: {
      sessions: { create: (...args: unknown[]) => mockPortalCreate(...args) },
    },
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  }),
  PRICE_IDS: { core: "price_core_123", professional: "price_pro_456", "multi-site": "price_multi_789" },
  SETUP_FEE_IDS: { core: "", professional: "", "multi-site": "" },
}))

// Mock Inngest
const mockSend = vi.fn().mockResolvedValue(undefined)
vi.mock("@/inngest/client", () => ({
  inngest: { send: (...args: unknown[]) => mockSend(...args) },
}))

const mockUser = { id: "user-1", email: "test@example.com" }

function makePostRequest(urlStr: string, body: Record<string, unknown>): Request {
  const url = new URL(urlStr)
  const req = new Request(urlStr, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  Object.defineProperty(req, "nextUrl", { value: url, writable: false })
  return req
}

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockSingle.mockResolvedValue({ data: { id: "client-1", stripe_customer_id: "cus_123", email: "test@example.com" } })
    mockCheckoutCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_123" })
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { POST } = await import("@/app/api/stripe/checkout/route")
    const res = await POST(makePostRequest("http://localhost/api/stripe/checkout", { planId: "core" }) as never)

    expect(res.status).toBe(401)
  })

  it("returns { url } on success", async () => {
    const { POST } = await import("@/app/api/stripe/checkout/route")
    const res = await POST(makePostRequest("http://localhost/api/stripe/checkout", { planId: "core" }) as never)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe("https://checkout.stripe.com/session_123")
  })

  it("maps planId to correct priceId", async () => {
    const { POST } = await import("@/app/api/stripe/checkout/route")
    await POST(makePostRequest("http://localhost/api/stripe/checkout", { planId: "professional" }) as never)

    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: expect.arrayContaining([
          expect.objectContaining({ price: "price_pro_456" }),
        ]),
      })
    )
  })
})

describe("POST /api/stripe/portal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockSingle.mockResolvedValue({ data: { stripe_customer_id: "cus_123" } })
    mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/portal_123" })
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { POST } = await import("@/app/api/stripe/portal/route")
    const res = await POST(makePostRequest("http://localhost/api/stripe/portal", {}) as never)

    expect(res.status).toBe(401)
  })

  it("returns { url } on success", async () => {
    const { POST } = await import("@/app/api/stripe/portal/route")
    const res = await POST(makePostRequest("http://localhost/api/stripe/portal", {}) as never)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe("https://billing.stripe.com/portal_123")
  })
})

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockSingle.mockResolvedValue({ data: { id: "client-1", email: "test@example.com", business_name: "Test Co" } })
  })

  it("validates Stripe signature and returns 400 on failure", async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error("Invalid signature")
    })

    const { POST } = await import("@/app/api/stripe/webhook/route")
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "bad_sig" },
      body: "{}",
    })
    const res = await POST(req as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Invalid signature")
  })

  it("handles checkout.session.completed event", async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_456",
          metadata: { userId: "user-1", clientId: "client-1", planId: "core" },
        },
      },
    })

    const { POST } = await import("@/app/api/stripe/webhook/route")
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "valid_sig" },
      body: "{}",
    })
    const res = await POST(req as never)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        stripe_customer_id: "cus_123",
        plan: "core",
        status: "active",
      })
    )
  })

  it("handles invoice.payment_failed event", async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: "invoice.payment_failed",
      data: {
        object: {
          id: "inv_123",
          customer: "cus_456",
          amount_due: 59700,
        },
      },
    })

    const { POST } = await import("@/app/api/stripe/webhook/route")
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "valid_sig" },
      body: "{}",
    })
    const res = await POST(req as never)

    expect(res.status).toBe(200)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "billing/payment.failed",
        data: expect.objectContaining({
          amount: 597,
          invoiceId: "inv_123",
        }),
      })
    )
  })
})
