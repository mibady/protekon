/**
 * Data & retention tab.
 * TODO(later): backends for export / deletion not yet wired — both rows
 * render as disabled stubs.
 */
export function DataTab() {
  return (
    <div className="space-y-6">
      <div
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          fontSize: "11px",
          letterSpacing: "3px",
          fontWeight: 600,
          borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
          paddingBottom: "0.5rem",
        }}
      >
        Data &amp; retention
      </div>

      {/* TODO(later): wire export pipeline — returns ZIP with documents, logs, incidents. */}
      <StubRow
        label="Export my data"
        hint="Download every document, training record, incident, and log your account holds. Auditor-ready ZIP."
        cta="Request export"
      />

      {/* TODO(later): wire deletion request flow (with confirmation + grace period). */}
      <StubRow
        label="Delete my account"
        hint="Permanently remove your data from Protekon. There's a 30-day grace window before destruction."
        cta="Request deletion"
        tone="enforcement"
      />

      <div
        className="font-sans"
        style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.5 }}
      >
        California Cal/OSHA requires incident records be retained for 5 years. After deletion, we
        keep hashed audit entries only — enough to prove the record existed, not enough to
        reconstruct its contents.
      </div>
    </div>
  )
}

function StubRow({
  label,
  hint,
  cta,
  tone = "steel",
}: {
  label: string
  hint: string
  cta: string
  tone?: "steel" | "enforcement"
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-4"
      style={{ borderTop: "1px solid rgba(11, 29, 58, 0.06)" }}
    >
      <div>
        <div
          className="font-sans"
          style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
        >
          {label}
        </div>
        <div
          className="font-sans mt-1"
          style={{ color: "var(--steel)", fontSize: "13px" }}
        >
          {hint}
        </div>
      </div>
      <button
        disabled
        className="font-display uppercase"
        style={{
          color: tone === "enforcement" ? "var(--enforcement)" : "var(--steel)",
          fontSize: "10px",
          letterSpacing: "2px",
          padding: "0.5rem 0.75rem",
          border: "1px solid rgba(11, 29, 58, 0.15)",
          background: "transparent",
          opacity: 0.5,
          cursor: "not-allowed",
        }}
      >
        {cta} — soon
      </button>
    </div>
  )
}
