/**
 * MetaLabel — ported from dashboard.jsx:105.
 * Tiny uppercase steel label used above small numeric stats.
 */

export function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase"
      style={{
        color: "var(--steel)",
        fontSize: "9px",
        letterSpacing: "2px",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  )
}
