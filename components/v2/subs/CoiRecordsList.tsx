"use client"

import { useMemo } from "react"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { CoiUploadButton } from "./CoiUploadButton"
import type { CoiRecord } from "@/lib/actions/coi"

type AvailableSub = {
  id: string
  company_name: string
  license_number?: string | null
}

type CoiRecordsListProps = {
  records: CoiRecord[]
  subs: AvailableSub[]
}

type ExtractionTone = "steel" | "sand" | "enforcement"

function extractionTone(status: string | null): ExtractionTone {
  const s = (status ?? "").toLowerCase()
  if (s === "verified" || s === "success" || s === "complete") return "steel"
  if (s === "pending" || s === "processing" || s === "partial") return "sand"
  if (s === "failed" || s === "error" || s === "rejected") return "enforcement"
  return "sand"
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return d
  }
}

function expirationTone(expiration: string | null): ExtractionTone {
  if (!expiration) return "enforcement"
  const d = new Date(expiration)
  const now = new Date()
  const in30 = new Date(Date.now() + 30 * 86400_000)
  if (d < now) return "enforcement"
  if (d < in30) return "sand"
  return "steel"
}

export function CoiRecordsList({ records, subs }: CoiRecordsListProps) {
  // Group records by sub_id, preserving sub roster order so empty subs show too.
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; records: CoiRecord[] }>()
    for (const s of subs) {
      map.set(s.id, { name: s.company_name, records: [] })
    }
    for (const r of records) {
      const entry = map.get(r.sub_id) ?? {
        name: r.sub_company_name ?? "Sub",
        records: [],
      }
      entry.records.push(r)
      map.set(r.sub_id, entry)
    }
    return Array.from(map.entries())
  }, [records, subs])

  if (grouped.length === 0) {
    return (
      <div
        className="p-10 text-center font-sans"
        style={{ color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}
      >
        No subs on the roster yet. Add subs from Sub Onboarding, then upload COIs here.
      </div>
    )
  }

  return (
    <div>
      {grouped.map(([subId, { name, records: subRecords }], idx) => (
        <section
          key={subId}
          style={{
            borderTop: idx === 0 ? "none" : "1px solid rgba(11, 29, 58, 0.08)",
          }}
        >
          <header
            className="flex items-center justify-between px-5 py-4"
            style={{ background: "rgba(11, 29, 58, 0.02)" }}
          >
            <div>
              <div
                className="font-display"
                style={{
                  color: "var(--ink)",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                {name}
              </div>
              <div
                className="font-sans"
                style={{
                  color: "var(--ink)",
                  opacity: 0.55,
                  fontSize: "12px",
                }}
              >
                {subRecords.length === 0
                  ? "No COI on file"
                  : `${subRecords.length} record${subRecords.length === 1 ? "" : "s"}`}
              </div>
            </div>
            <CoiUploadButton subId={subId} subName={name} />
          </header>

          {subRecords.length > 0 && (
            <ul>
              {subRecords.map((r) => (
                <li
                  key={r.id}
                  className="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                  style={{ borderTop: "1px solid rgba(11, 29, 58, 0.05)" }}
                >
                  <div className="md:col-span-3">
                    <Label>Carrier</Label>
                    <Value>{r.carrier_name ?? "—"}</Value>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Policy</Label>
                    <Value>{r.policy_number ?? "—"}</Value>
                    {r.policy_type && (
                      <div
                        className="font-sans"
                        style={{
                          color: "var(--ink)",
                          opacity: 0.5,
                          fontSize: "11px",
                        }}
                      >
                        {r.policy_type}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label>Limit</Label>
                    <Value>
                      {r.coverage_limit != null
                        ? `$${r.coverage_limit.toLocaleString()}`
                        : "—"}
                    </Value>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Effective</Label>
                    <Value>{formatDate(r.effective_date)}</Value>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Expires</Label>
                    <div className="flex items-center gap-2">
                      <Value>{formatDate(r.expiration_date)}</Value>
                      <PriorityPill tone={expirationTone(r.expiration_date)}>
                        {expirationTone(r.expiration_date) === "enforcement"
                          ? r.expiration_date
                            ? "expired"
                            : "none"
                          : expirationTone(r.expiration_date) === "sand"
                          ? "soon"
                          : "ok"}
                      </PriorityPill>
                    </div>
                  </div>
                  <div className="md:col-span-1 text-right">
                    <PriorityPill tone={extractionTone(r.extraction_status)}>
                      {r.extraction_status ?? "pending"}
                    </PriorityPill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase mb-1"
      style={{
        color: "var(--ink)",
        opacity: 0.5,
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  )
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-sans"
      style={{ color: "var(--ink)", fontSize: "14px" }}
    >
      {children}
    </div>
  )
}
