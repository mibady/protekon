/**
 * The uppercase tracking labels that precede each section of a surface.
 * Gold dot prefix, steel text, tight letter-spacing. Used throughout Briefing,
 * Coverage overview, and any section heading that sits above a content block.
 *
 * Example: "▸ HANDLED THIS WEEK"
 *          "▸ I NEED YOU ON"
 *          "▸ WHAT'S HAPPENING OUT THERE"
 */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className="inline-block bg-gold"
        style={{ width: 6, height: 6, borderRadius: 0 }}
        aria-hidden
      />
      <span className="text-[11px] font-sans font-medium tracking-[0.25em] text-steel uppercase">
        {children}
      </span>
    </div>
  )
}
