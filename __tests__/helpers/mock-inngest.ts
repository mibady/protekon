import { vi, expect } from "vitest"

export const mockSend = vi.fn().mockResolvedValue(undefined)

export function setupInngestMock() {
  vi.mock("@/inngest/client", () => ({
    inngest: { send: mockSend },
  }))
}

/** Assert an Inngest event was fired with the expected name and data subset */
export function expectEvent(name: string, dataMatch?: Record<string, unknown>) {
  expect(mockSend).toHaveBeenCalledWith(
    expect.objectContaining({
      name,
      ...(dataMatch ? { data: expect.objectContaining(dataMatch) } : {}),
    })
  )
}

/** Assert no Inngest events were fired */
export function expectNoEvents() {
  expect(mockSend).not.toHaveBeenCalled()
}
