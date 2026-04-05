import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

// Mock Vercel Blob
const mockPut = vi.fn()
vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => mockPut(...args),
}))

const mockUser = { id: "user-1", email: "test@example.com" }

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buffer = new ArrayBuffer(sizeBytes)
  return new File([buffer], name, { type })
}

function makeRequest(file: File): Request {
  const formData = new FormData()
  formData.append("file", file)
  return new Request("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  })
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockPut.mockResolvedValue({ url: "https://blob.vercel-storage.com/uploads/file.pdf" })
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { POST } = await import("@/app/api/upload/route")
    const file = makeFile("test.pdf", "application/pdf", 1024)
    const res = await POST(makeRequest(file) as never)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe("Unauthorized")
  })

  it("returns 400 for invalid file type", async () => {
    const { POST } = await import("@/app/api/upload/route")
    const file = makeFile("script.exe", "application/x-msdownload", 1024)
    const res = await POST(makeRequest(file) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("File type not allowed")
  })

  it("accepts PDF, PNG, JPG, DOCX files", async () => {
    const allowedFiles = [
      makeFile("doc.pdf", "application/pdf", 1024),
      makeFile("img.png", "image/png", 1024),
      makeFile("photo.jpg", "image/jpeg", 1024),
      makeFile("report.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1024),
    ]

    for (const file of allowedFiles) {
      vi.resetModules()
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockPut.mockResolvedValue({ url: `https://blob.vercel-storage.com/uploads/${file.name}` })

      const { POST } = await import("@/app/api/upload/route")
      const res = await POST(makeRequest(file) as never)

      expect(res.status).toBe(200)
    }
  })

  it("enforces 10MB size limit", async () => {
    const { POST } = await import("@/app/api/upload/route")
    const largeFile = makeFile("huge.pdf", "application/pdf", 11 * 1024 * 1024)
    const res = await POST(makeRequest(largeFile) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("File too large (max 10MB)")
  })

  it("returns { url, filename } on success", async () => {
    const { POST } = await import("@/app/api/upload/route")
    const file = makeFile("report.pdf", "application/pdf", 2048)
    mockPut.mockResolvedValueOnce({ url: "https://blob.vercel-storage.com/uploads/report.pdf" })

    const res = await POST(makeRequest(file) as never)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe("https://blob.vercel-storage.com/uploads/report.pdf")
    expect(json.filename).toBe("report.pdf")
  })
})
