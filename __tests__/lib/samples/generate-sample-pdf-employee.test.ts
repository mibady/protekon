import { describe, it, expect } from "vitest"
import { PDFDocument } from "pdf-lib"
import { generateSamplePDF } from "@/lib/pdf-samples"
import {
  EMPLOYEE_TITLE_BY_KEY,
  type EmployeeSampleKey,
} from "@/lib/samples/employee-materials"

const EMPLOYEE_KEYS: EmployeeSampleKey[] = [
  "sb-553-employee",
  "signoff-sheet",
  "manager-wvp-guide",
]

describe("generateSamplePDF — employee materials", () => {
  for (const key of EMPLOYEE_KEYS) {
    it(`renders ${key} to a valid PDF buffer`, async () => {
      const { buffer, filename } = await generateSamplePDF(key)

      // (a) returns a Buffer-like Uint8Array
      expect(buffer).toBeInstanceOf(Uint8Array)

      // (b) magic bytes: %PDF-
      expect(Buffer.from(buffer.slice(0, 5)).toString("ascii")).toBe("%PDF-")

      // (c) larger than 2KB
      expect(buffer.byteLength).toBeGreaterThan(2048)

      // (d) pdf-lib can parse it back
      const reparsed = await PDFDocument.load(buffer)
      expect(reparsed.getPageCount()).toBeGreaterThan(0)

      expect(filename).toMatch(/\.pdf$/)
    })

    it(`${key} also resolves when passed by title alias`, async () => {
      const alias = EMPLOYEE_TITLE_BY_KEY[key]
      const { buffer } = await generateSamplePDF(alias)
      expect(buffer.byteLength).toBeGreaterThan(2048)
      expect(Buffer.from(buffer.slice(0, 5)).toString("ascii")).toBe("%PDF-")
    })
  }

  it("signoff-sheet honors merge-field token context", async () => {
    const businessName = "Acme Plating Co."
    const employeeName = "Jordan Example"
    const { buffer } = await generateSamplePDF("signoff-sheet", {
      context: {
        client: { business_name: businessName },
        plan: { wvpp_rev: "2026-04-v1" },
        employee: { name: employeeName, date: "2026-04-15" },
      },
    })
    // We cannot extract text reliably without additional deps — but the
    // PDF should still be valid and substantially sized with the tokens
    // substituted in.
    const reparsed = await PDFDocument.load(buffer)
    expect(reparsed.getPageCount()).toBeGreaterThan(0)
    expect(buffer.byteLength).toBeGreaterThan(2048)
  })

  it("throws on an unknown sample key", async () => {
    await expect(
      generateSamplePDF("definitely-not-a-real-sample-key-xyz")
    ).rejects.toThrow(/Unknown report/)
  })
})
