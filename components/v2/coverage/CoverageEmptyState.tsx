/**
 * Shown on list-mode routes when the client has no rows for the resource
 * type. Stays in officer voice — "I haven't seen anything here yet" — rather
 * than the generic "No results" pattern.
 */
export function CoverageEmptyState({
  label,
  singular,
  description,
}: {
  label: string
  singular: string
  description: string | null
}) {
  return (
    <div className="flex-1 px-8 pb-12 max-w-2xl w-full mx-auto">
      <div className="bg-white p-10 text-center">
        <h2 className="font-display text-2xl text-midnight mb-3">
          No {label.toLowerCase()} on record yet.
        </h2>
        <p className="text-sm text-steel font-sans leading-relaxed">
          {description ??
            `I haven't logged any ${label.toLowerCase()} for you yet. As soon as you add your first ${singular.toLowerCase()}, I'll start tracking it here and flagging anything that needs your attention.`}
        </p>
      </div>
    </div>
  )
}
