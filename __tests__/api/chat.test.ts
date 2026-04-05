import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockLimit = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: vi.fn(() => ({
      select: vi.fn((...args: unknown[]) => {
        mockSelect(...args)
        return {
          eq: vi.fn(() => ({
            single: () => mockSingle(),
            order: vi.fn(() => ({
              limit: (...lArgs: unknown[]) => {
                mockLimit(...lArgs)
                return mockOrder
              },
            })),
          })),
          order: vi.fn(() => ({
            limit: (...lArgs: unknown[]) => {
              mockLimit(...lArgs)
              return mockOrder
            },
          })),
        }
      }),
    })),
  }),
}))

// Mock AI SDK streamText
const mockStreamText = vi.fn()
vi.mock("ai", () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
}))

// Mock Anthropic provider
const mockAnthropic = vi.fn().mockReturnValue("mock-model")
vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: (...args: unknown[]) => mockAnthropic(...args),
}))

const mockUser = { id: "user-1", email: "test@example.com" }

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockSingle.mockResolvedValue({
      data: { business_name: "Test Co", vertical: "construction", compliance_score: 85, risk_level: "low", plan: "core" },
    })
    mockOrder.mockResolvedValue({ data: [] })
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: vi.fn().mockReturnValue(
        new Response("streaming response", { status: 200, headers: { "content-type": "text/event-stream" } })
      ),
    })
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(makeRequest({ messages: [] }))

    expect(res.status).toBe(401)
  })

  it("calls Anthropic via AI SDK streamText", async () => {
    const { POST } = await import("@/app/api/chat/route")
    await POST(makeRequest({ messages: [{ role: "user", content: "Hello" }] }))

    expect(mockAnthropic).toHaveBeenCalledWith("claude-sonnet-4-6")
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        messages: [{ role: "user", content: "Hello" }],
      })
    )
  })

  it("includes client context in system prompt", async () => {
    const { POST } = await import("@/app/api/chat/route")
    await POST(makeRequest({ messages: [{ role: "user", content: "What is my score?" }] }))

    const call = mockStreamText.mock.calls[0][0]
    expect(call.system).toContain("Test Co")
    expect(call.system).toContain("construction")
    expect(call.system).toContain("Protekon Compliance Assistant")
  })

  it("returns streaming response", async () => {
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(makeRequest({ messages: [{ role: "user", content: "Hello" }] }))

    expect(res.status).toBe(200)
    expect(mockStreamText.mock.results[0].value.toUIMessageStreamResponse).toHaveBeenCalled()
  })
})
