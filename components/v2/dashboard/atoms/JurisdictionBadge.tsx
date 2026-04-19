/**
 * JurisdictionBadge — ported from dashboard.jsx:210.
 * Dark parchment pill with sand dot + caption below.
 */

export function JurisdictionBadge() {
  return (
    <div className="flex flex-col gap-1.5" style={{ alignItems: "flex-start" }}>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5"
        style={{ background: "var(--void)", color: "var(--parchment)" }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--sand)" }} />
        <span className="font-display uppercase" style={{ fontSize: "10px", letterSpacing: "2px", fontWeight: 600, whiteSpace: "nowrap" }}>
          Cal/OSHA Jurisdiction
        </span>
      </div>
      <span className="font-sans italic" style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.4 }}>
        Stricter standards apply · 7 templates beyond federal minimum
      </span>
    </div>
  )
}
