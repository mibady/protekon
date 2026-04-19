/**
 * Flat off-white surface with an optional left-border accent.
 *
 * Matches the Remix `atoms.jsx` Card — no shadow, 1px midnight-at-8% border,
 * optional 3px colored accent rail on the left edge.
 *
 * Example:
 *   <Card accent="enforcement" padding="p-6">
 *     <SectionLabel>DEADLINE</SectionLabel>
 *     ...
 *   </Card>
 */
type CardAccent = "enforcement" | "sand" | "steel" | null

type CardProps = {
  children: React.ReactNode
  accent?: CardAccent
  padding?: string
  className?: string
}

const ACCENT_VAR: Record<Exclude<CardAccent, null>, string> = {
  enforcement: "var(--enforcement)",
  sand: "var(--sand)",
  steel: "var(--steel)",
}

export function Card({
  children,
  accent = null,
  padding = "p-6",
  className = "",
}: CardProps) {
  const borderLeft =
    accent !== null
      ? { borderLeft: `3px solid ${ACCENT_VAR[accent]}` }
      : undefined

  return (
    <div
      className={`${padding} ${className}`.trim()}
      style={{
        background: "var(--white)",
        border: "1px solid rgba(11, 29, 58, 0.08)",
        ...borderLeft,
      }}
    >
      {children}
    </div>
  )
}
