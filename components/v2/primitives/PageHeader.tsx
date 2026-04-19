/**
 * Editorial page header: eyebrow + display title + optional subtitle.
 *
 * Matches the Remix `atoms.jsx` PageHeader voice — uppercase tracked eyebrow,
 * Barlow Condensed 700 display title, muted body subtitle capped at a
 * comfortable reading measure.
 *
 * Example:
 *   <PageHeader
 *     eyebrow="COVERAGE"
 *     title="Your standards, your exposure."
 *     subtitle="Every regulation that applies to your business, every document you owe, every deadline on the horizon."
 *   />
 */
type PageHeaderProps = {
  eyebrow: string
  title: string
  subtitle?: string
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-10">
      <div
        className="font-display uppercase mb-3"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: "11px",
          letterSpacing: "3px",
          fontWeight: 500,
        }}
      >
        {eyebrow}
      </div>
      <h1
        className="font-display tracking-tight"
        style={{
          color: "var(--ink)",
          fontSize: "clamp(28px, 4vw, 36px)",
          fontWeight: 700,
          marginBottom: "20px",
          paddingBottom: "0.15em",
          lineHeight: 1.2,
          textWrap: "pretty",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="font-sans"
          style={{
            color: "var(--ink)",
            opacity: 0.7,
            fontSize: "16px",
            lineHeight: 1.55,
            maxWidth: "42rem",
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
