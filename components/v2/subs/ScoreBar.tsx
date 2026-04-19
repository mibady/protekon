/**
 * Horizontal score bar with optional weight + item count.
 *
 * Ported from Remix `phase3c.jsx:127`. Score is 0–100. Color ramps from
 * enforcement (low/bad) through sand (mid) to steel (high/good) — matches
 * CSLB risk convention where lower score = higher risk.
 */
type ScoreBarProps = {
  score: number | null
  label?: string
  weight?: string
  items?: number | null
  invert?: boolean
}

export function ScoreBar({
  score,
  label,
  weight,
  items,
  invert = false,
}: ScoreBarProps) {
  const raw = score ?? 0
  const clamped = Math.max(0, Math.min(100, raw))
  // When invert=true (default CSLB semantics), high score = HIGHER risk = red.
  // When invert=false, high score = HIGHER trust = green/steel.
  const color = invert
    ? clamped >= 70
      ? "var(--enforcement)"
      : clamped >= 40
      ? "var(--sand)"
      : "var(--steel)"
    : clamped >= 70
    ? "var(--steel)"
    : clamped >= 40
    ? "var(--sand)"
    : "var(--enforcement)"

  return (
    <div className="w-full">
      {(label || weight || items != null) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span
              className="font-display uppercase"
              style={{
                color: "var(--ink)",
                opacity: 0.65,
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
              }}
            >
              {label}
            </span>
          )}
          <span
            className="font-sans"
            style={{
              color: "var(--ink)",
              opacity: 0.7,
              fontSize: "11px",
            }}
          >
            {score == null ? "—" : `${clamped}`}
            {weight ? ` · ${weight}` : ""}
            {items != null ? ` · ${items} items` : ""}
          </span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "6px",
          background: "rgba(11, 29, 58, 0.08)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            background: color,
          }}
        />
      </div>
    </div>
  )
}
