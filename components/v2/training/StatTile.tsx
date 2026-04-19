/**
 * Small compliance stat tile: uppercase label, big number, supporting note,
 * 3px colored accent rail on the left edge. Matches LogStatTile from Remix.
 */
type StatTileAccent = "enforcement" | "sand" | "steel" | "ink"

type StatTileProps = {
  label: string
  value: string | number
  note: string
  accent?: StatTileAccent
}

const ACCENT_VAR: Record<StatTileAccent, string> = {
  enforcement: "var(--enforcement)",
  sand: "var(--sand)",
  steel: "var(--steel)",
  ink: "var(--ink)",
}

export function StatTile({ label, value, note, accent = "steel" }: StatTileProps) {
  return (
    <div
      className="p-5"
      style={{
        background: "var(--white)",
        border: "1px solid rgba(11, 29, 58, 0.08)",
        borderLeft: `3px solid ${ACCENT_VAR[accent]}`,
      }}
    >
      <div
        className="font-display uppercase mb-2"
        style={{
          color: "var(--steel)",
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          color: "var(--ink)",
          fontSize: "32px",
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        className="font-sans"
        style={{ color: "var(--steel)", fontSize: "12px" }}
      >
        {note}
      </div>
    </div>
  )
}
