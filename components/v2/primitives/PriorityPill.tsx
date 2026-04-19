/**
 * Inline uppercase priority marker — colored text only, no background or border.
 *
 * Matches the Remix `atoms.jsx` PriorityPill. Barlow Condensed 600, 10px,
 * 2px tracking. Tone maps to the three brand accents.
 *
 * Example:
 *   <PriorityPill tone="enforcement">URGENT</PriorityPill>
 *   <PriorityPill tone="sand">WATCH</PriorityPill>
 *   <PriorityPill tone="steel">INFO</PriorityPill>
 */
type PriorityTone = "enforcement" | "sand" | "steel"

type PriorityPillProps = {
  tone: PriorityTone
  children: React.ReactNode
}

const TONE_VAR: Record<PriorityTone, string> = {
  enforcement: "var(--enforcement)",
  sand: "var(--sand)",
  steel: "var(--steel)",
}

export function PriorityPill({ tone, children }: PriorityPillProps) {
  return (
    <span
      className="font-display uppercase"
      style={{
        color: TONE_VAR[tone],
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}
