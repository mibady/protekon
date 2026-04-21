import type { OnboardingState } from "@/lib/types/onboarding"

type Props = {
  state: OnboardingState
  businessName: string | null
}

/**
 * Right-rail preview that fills in as the user progresses. Reads only from
 * the state prop — no additional queries. Sample sections are visually
 * distinct (dashed border, muted) so users see the preview grow.
 */
export function DashboardPreview({ state, businessName }: Props) {
  const { config, preview, client } = state
  const showThirdParties = config.stepVisibility.thirdParties
  const showSites = config.stepVisibility.sites

  return (
    <aside className="flex h-full flex-col gap-4 border-l border-brand-white/[0.08] bg-midnight/40 p-6">
      <header className="flex flex-col gap-1 pb-3">
        <span className="font-display text-[10px] font-semibold tracking-[3px] uppercase text-steel">
          Live Preview
        </span>
        <h2 className="font-display text-[16px] font-bold text-parchment">Your dashboard</h2>
      </header>

      <PreviewCard
        label="Company"
        primary={businessName ?? "Unnamed Company"}
        secondary={config.label}
        badges={client.operatingStates}
      />

      {showSites ? (
        <PreviewCountCard
          label={`${pluralize("Site", preview.sitesCount)}`}
          count={preview.sitesCount}
          placeholder="Will populate after Step 3 (Sites)"
        />
      ) : null}

      <PreviewCountCard
        label={`${pluralize(config.peopleTerminology.worker, preview.workersCount)}`}
        count={preview.workersCount}
        placeholder="Will populate after Step 4 (People)"
      />

      {showThirdParties && config.peopleTerminology.thirdParty ? (
        <PreviewCountCard
          label={`${pluralize(config.peopleTerminology.thirdParty, preview.thirdPartiesCount)}`}
          count={preview.thirdPartiesCount}
          placeholder="Will populate after Step 5"
        />
      ) : null}

      <PreviewCountCard
        label={`${pluralize("Document", preview.documentsCount)}`}
        count={preview.documentsCount}
        placeholder="Will populate after Step 6 (Documents)"
      />

      <PostureCard score={preview.postureScore} />
    </aside>
  )
}

function PreviewCard({
  label,
  primary,
  secondary,
  badges,
}: {
  label: string
  primary: string
  secondary?: string
  badges?: string[]
}) {
  return (
    <div className="border border-brand-white/[0.08] bg-void/40 p-4">
      <div className="font-display text-[10px] font-semibold tracking-[2px] uppercase text-steel">
        {label}
      </div>
      <div className="mt-1 font-display text-[15px] font-bold text-parchment">{primary}</div>
      {secondary ? (
        <div className="mt-0.5 font-sans text-[12px] text-fog">{secondary}</div>
      ) : null}
      {badges && badges.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {badges.map((b) => (
            <span
              key={b}
              className="border border-gold/30 bg-gold/5 px-2 py-0.5 font-display text-[10px] tracking-[1px] text-gold"
            >
              {b}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PreviewCountCard({
  label,
  count,
  placeholder,
}: {
  label: string
  count: number
  placeholder: string
}) {
  const empty = count === 0
  return (
    <div
      className={[
        "p-4",
        empty
          ? "border border-dashed border-steel/20 bg-transparent"
          : "border border-brand-white/[0.08] bg-void/40",
      ].join(" ")}
    >
      <div className="font-display text-[10px] font-semibold tracking-[2px] uppercase text-steel">
        {label}
      </div>
      {empty ? (
        <>
          <div className="mt-1 font-display text-[22px] font-bold text-steel/50">—</div>
          <div className="mt-1 font-sans text-[11px] italic text-steel/60">{placeholder}</div>
        </>
      ) : (
        <div className="mt-1 font-display text-[22px] font-bold text-parchment">{count}</div>
      )}
    </div>
  )
}

function PostureCard({ score }: { score: number | null }) {
  const empty = score === null
  const label =
    score === null
      ? "Available after Step 6"
      : score >= 80
        ? "Strong"
        : score >= 60
          ? "Needs work"
          : "At risk"

  const tone =
    score === null
      ? "text-steel/50"
      : score >= 80
        ? "text-emerald-400"
        : score >= 60
          ? "text-gold"
          : "text-crimson"

  return (
    <div
      className={[
        "p-4",
        empty
          ? "border border-dashed border-steel/20 bg-transparent"
          : "border border-brand-white/[0.08] bg-void/40",
      ].join(" ")}
    >
      <div className="font-display text-[10px] font-semibold tracking-[2px] uppercase text-steel">
        Posture
      </div>
      <div className={["mt-1 font-display text-[22px] font-bold", tone].join(" ")}>
        {empty ? "—" : `${score}`}
      </div>
      <div className="mt-1 font-sans text-[11px] italic text-steel/60">{label}</div>
    </div>
  )
}

function pluralize(word: string, n: number): string {
  if (n === 1) return `1 ${word}`
  return `${n} ${word}s`
}
