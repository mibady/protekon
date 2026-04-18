import {
  Chat,
  Clipboard,
  FileArrowDown,
  MagnifyingGlass,
  Scroll,
  Shield,
  Warning,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react/dist/lib/types"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Findings — OSHA citations, internal audit findings, and equivalent
 * regulator-driven corrective-action records.
 *
 * Prod table: `public.findings`. Verified columns (2026-04-16):
 *   id, client_id, site_id (nullable), source_type, source_id (nullable),
 *   classification, description, citation_text, citation_standard,
 *   penalty_amount, abatement_due_date, abatement_status, appeal_deadline,
 *   responsible_person_id, evidence_urls text[], vertical_data jsonb,
 *   created_at, updated_at
 *
 * Enum values:
 *   source_type     ∈ {inspection, incident, complaint, internal_audit,
 *                      protekon_audit, regulatory_notice}
 *   classification  ∈ {other_than_serious, serious, willful, repeat,
 *                      failure_to_abate, informational}
 *   abatement_status ∈ {open, in_progress, abated, contested, closed}
 *
 * SPEC MAPPING (NGE-480 body uses aspirational names — prod columns win):
 *   classification        ↔ spec's `severity`
 *   abatement_status      ↔ spec's `status`
 *   abatement_due_date    ↔ spec's `due_at`
 *   responsible_person_id ↔ spec's `owner`
 *   created_at            ↔ spec's `opened_at`
 *   citation_standard     ↔ spec's `finding_ref`
 *
 * STATUS-BAND DIVERGENCE (NGE-480 v1 → v2 follow-up):
 * The `findings_roll` CASE in v_client_resources uses classification-based
 * priority for attention/critical buckets. This file's `statusFn` uses the
 * spec's due-date-first logic (past-due → critical, ≤14d out → attention,
 * otherwise neutral). Overview rollup counts therefore won't always match
 * the per-row badges displayed here. Same pattern as NGE-474's 30/60-day
 * divergence — accepted for v1, tracked as a follow-up ticket to realign
 * the view to past-due-first priority.
 */

// ──────────────────────────────────────────────────────────────────────────
// Small helpers
// ──────────────────────────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000

function daysUntil(iso: string): number {
  const delta = new Date(iso).getTime() - Date.now()
  return Math.floor(delta / MS_PER_DAY)
}

function daysAgo(iso: string): number {
  const delta = Date.now() - new Date(iso).getTime()
  return Math.floor(delta / MS_PER_DAY)
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatMoney(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined) return null
  if (amount === 0) return null
  return `$${amount.toLocaleString("en-US")}`
}

// ──────────────────────────────────────────────────────────────────────────
// Source-type presentation
// ──────────────────────────────────────────────────────────────────────────

const SOURCE_META: Record<
  string,
  { label: string; icon: Icon; tone: "steel" | "gold" | "crimson" }
> = {
  inspection: { label: "Inspection", icon: Clipboard, tone: "steel" },
  incident: { label: "Incident", icon: Warning, tone: "gold" },
  complaint: { label: "Complaint", icon: Chat, tone: "gold" },
  internal_audit: {
    label: "Internal audit",
    icon: MagnifyingGlass,
    tone: "steel",
  },
  protekon_audit: { label: "Protekon audit", icon: Shield, tone: "steel" },
  regulatory_notice: {
    label: "Regulatory notice",
    icon: Scroll,
    tone: "crimson",
  },
}

const SOURCE_TONE_CLASSES: Record<
  "steel" | "gold" | "crimson",
  { bg: string; text: string }
> = {
  steel: { bg: "bg-steel/10", text: "text-steel" },
  gold: { bg: "bg-gold/10", text: "text-gold" },
  crimson: { bg: "bg-crimson/10", text: "text-crimson" },
}

function SourceBadge({ source }: { source: string | null }) {
  const meta = source ? SOURCE_META[source] : undefined
  if (!meta) {
    return <span className="text-sm italic text-steel">—</span>
  }
  const classes = SOURCE_TONE_CLASSES[meta.tone]
  const IconEl = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-sans tracking-wide ${classes.bg} ${classes.text}`}
      style={{ borderRadius: 0 }}
    >
      <IconEl size={12} weight="regular" />
      {meta.label}
    </span>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Classification (severity) presentation
// ──────────────────────────────────────────────────────────────────────────

const CLASSIFICATION_TONE: Record<string, "crimson" | "gold" | "steel" | "fog"> =
  {
    willful: "crimson",
    repeat: "crimson",
    failure_to_abate: "crimson",
    serious: "gold",
    other_than_serious: "steel",
    informational: "fog",
  }

const CLASSIFICATION_TONE_CLASSES: Record<
  "crimson" | "gold" | "steel" | "fog",
  { bg: string; text: string }
> = {
  crimson: { bg: "bg-crimson/10", text: "text-crimson" },
  gold: { bg: "bg-gold/10", text: "text-gold" },
  steel: { bg: "bg-steel/10", text: "text-steel" },
  fog: { bg: "bg-fog/40", text: "text-steel" },
}

function classificationLabel(value: string | null): string {
  if (!value) return "—"
  return value.replace(/_/g, " ")
}

function ClassificationPill({ value }: { value: string | null }) {
  if (!value) return <span className="text-sm italic text-steel">—</span>
  const tone = CLASSIFICATION_TONE[value] ?? "steel"
  const classes = CLASSIFICATION_TONE_CLASSES[tone]
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] tracking-[0.2em] font-sans font-medium uppercase ${classes.bg} ${classes.text}`}
      style={{ borderRadius: 0 }}
    >
      {classificationLabel(value)}
    </span>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Days-countdown cells
// ──────────────────────────────────────────────────────────────────────────

function DueCell({ iso }: { iso: string | null }) {
  if (!iso) {
    return <span className="italic text-steel">No deadline set</span>
  }
  const days = daysUntil(iso)
  const short = formatShortDate(iso)
  if (days < 0) {
    const past = Math.abs(days)
    return (
      <span className="text-crimson">
        {short} · {past} day{past === 1 ? "" : "s"} past
      </span>
    )
  }
  if (days <= 14) {
    return (
      <span className="text-gold">
        {short} · due in {days} day{days === 1 ? "" : "s"}
      </span>
    )
  }
  return (
    <span className="text-steel">
      {short} · in {days} days
    </span>
  )
}

function OpenedCell({ iso }: { iso: string | null }) {
  if (!iso) return <span className="italic text-steel">—</span>
  const short = formatShortDate(iso)
  const age = daysAgo(iso)
  if (age > 30) {
    return (
      <span>
        {short} <sup className="text-[10px] text-steel">{age}d ago</sup>
      </span>
    )
  }
  return <span>{short}</span>
}

// ──────────────────────────────────────────────────────────────────────────
// Detail-section sub-renderers
// ──────────────────────────────────────────────────────────────────────────

function AbatementDueBlock({ iso }: { iso: string | null }) {
  if (!iso) {
    return <span className="italic text-steel">No abatement date set</span>
  }
  const days = daysUntil(iso)
  const short = formatShortDate(iso)
  if (days < 0) {
    const past = Math.abs(days)
    return (
      <span className="font-display text-crimson">
        {short} · {past} day{past === 1 ? "" : "s"} past due
      </span>
    )
  }
  if (days <= 14) {
    return (
      <span className="font-display text-gold">
        {short} · {days} day{days === 1 ? "" : "s"} remaining
      </span>
    )
  }
  return (
    <span className="font-display text-midnight">
      {short} · {days} days remaining
    </span>
  )
}

function EvidenceBlock({ urls }: { urls: string[] }) {
  if (!urls.length) {
    return (
      <span className="italic text-steel">
        No proof of abatement uploaded yet.
      </span>
    )
  }
  return (
    <ul className="flex flex-col gap-1">
      {urls.map((url) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-midnight underline decoration-steel/40 underline-offset-2 hover:decoration-crimson hover:text-crimson"
          >
            <FileArrowDown size={16} weight="regular" />
            <span className="truncate max-w-[28rem]">{url}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────────

export const findingsConfig: ResourceConfig<ResourceRow> = {
  type: "findings",
  defaultLabel: "Findings",
  defaultSingular: "Finding",
  defaultDescription:
    "No open citations or findings. When something gets called out — by a regulator, in an inspection, during a self-audit — I'll track the clock here so nothing slips past abatement.",
  columns: [
    {
      key: "source_type",
      label: "Source",
      value: (row) => (row.source_type as string | null) ?? null,
      render: (row) => (
        <SourceBadge source={(row.source_type as string | null) ?? null} />
      ),
    },
    {
      key: "citation_standard",
      label: "Ref#",
      value: (row) => {
        const standard = row.citation_standard as string | null
        if (standard && standard.trim().length > 0) return standard
        const text = row.citation_text as string | null
        if (text && text.trim().length > 0) {
          return text.length > 40 ? `${text.slice(0, 40)}…` : text
        }
        return "—"
      },
    },
    {
      key: "classification",
      label: "Severity",
      value: (row) =>
        classificationLabel((row.classification as string | null) ?? null),
      render: (row) => (
        <ClassificationPill
          value={(row.classification as string | null) ?? null}
        />
      ),
    },
    {
      key: "created_at",
      label: "Opened",
      value: (row) => {
        const iso = row.created_at as string | null
        return iso ? formatShortDate(iso) : null
      },
      render: (row) => (
        <OpenedCell iso={(row.created_at as string | null) ?? null} />
      ),
      secondary: true,
    },
    {
      key: "abatement_due_date",
      label: "Due",
      value: (row) => {
        const iso = row.abatement_due_date as string | null
        return iso ? formatShortDate(iso) : "No deadline set"
      },
      render: (row) => (
        <DueCell iso={(row.abatement_due_date as string | null) ?? null} />
      ),
    },
    {
      key: "responsible_person_id",
      label: "Owner",
      value: (row) => {
        const id = row.responsible_person_id as string | null
        return id ?? "Unassigned"
      },
      render: (row) => {
        const id = row.responsible_person_id as string | null
        if (id) return <span className="text-steel">{id}</span>
        return <span className="italic text-gold">Unassigned</span>
      },
      secondary: true,
    },
    {
      key: "abatement_status",
      label: "Status",
      value: (row) => (row.abatement_status as string | null) ?? null,
    },
  ],
  detailSections: [
    {
      label: "Finding",
      render: (row) => {
        const classification = (row.classification as string | null) ?? null
        const source = (row.source_type as string | null) ?? null
        const sourceMeta = source ? SOURCE_META[source] : undefined
        const standard = (row.citation_standard as string | null) ?? null
        const sourceLine = [
          sourceMeta?.label ?? (source ? source.replace(/_/g, " ") : null),
          standard,
        ]
          .filter((part): part is string => !!part && part.length > 0)
          .join(" · ")
        const citationText = (row.citation_text as string | null) ?? null
        const description = (row.description as string | null) ?? null
        return [
          {
            label: "Classification",
            value: classification ?? "—",
            render: <ClassificationPill value={classification} />,
          },
          {
            label: "Source",
            value: sourceLine.length > 0 ? sourceLine : null,
          },
          {
            label: "Citation text",
            value: citationText,
            render: citationText ? (
              <p className="whitespace-pre-line text-midnight font-sans text-sm leading-relaxed">
                {citationText}
              </p>
            ) : undefined,
          },
          {
            label: "Description",
            value: description,
            render: description ? (
              <p className="whitespace-pre-line text-midnight font-sans text-sm leading-relaxed">
                {description}
              </p>
            ) : undefined,
          },
        ]
      },
    },
    {
      label: "Abatement",
      render: (row) => {
        const status = (row.abatement_status as string | null) ?? null
        const due = (row.abatement_due_date as string | null) ?? null
        const appeal = (row.appeal_deadline as string | null) ?? null
        return [
          {
            label: "Status",
            value: status ? status.replace(/_/g, " ") : null,
          },
          {
            label: "Abatement due",
            value: due ?? "No abatement date set",
            render: <AbatementDueBlock iso={due} />,
          },
          {
            label: "Appeal deadline",
            value: status === "contested" ? appeal : null,
            render:
              status === "contested" && appeal ? (
                <span>{formatShortDate(appeal)}</span>
              ) : undefined,
          },
        ]
      },
    },
    {
      label: "Penalty",
      render: (row) => {
        const amount =
          (row.penalty_amount as number | null | undefined) ?? null
        const status = (row.abatement_status as string | null) ?? null
        const money = formatMoney(amount)
        if (!money) {
          // Empty value → CoverageDetail suppresses the whole section.
          return [{ label: "Proposed penalty", value: null }]
        }
        if (status === "contested") {
          return [
            {
              label: "Proposed penalty",
              value: `${money} · Under appeal`,
              render: (
                <span>
                  <span className="font-display text-midnight">{money}</span>{" "}
                  <span className="text-sm font-sans text-gold">
                    · Under appeal
                  </span>
                </span>
              ),
            },
          ]
        }
        return [
          {
            label: "Proposed penalty",
            value: money,
          },
        ]
      },
    },
    {
      label: "Evidence of abatement",
      render: (row) => {
        const raw = row.evidence_urls as unknown
        const urls = Array.isArray(raw)
          ? (raw as unknown[]).filter(
              (u): u is string => typeof u === "string" && u.length > 0
            )
          : []
        return [
          {
            label: "Uploaded proof",
            // Keep the value populated so the section always renders — we
            // want the officer-voice empty note visible when nothing is on
            // file.
            value:
              urls.length > 0 ? `${urls.length} file(s)` : "Nothing on file",
            render: <EvidenceBlock urls={urls} />,
          },
        ]
      },
    },
    {
      label: "Responsible",
      render: (row) => {
        const id = (row.responsible_person_id as string | null) ?? null
        if (id) {
          return [
            {
              label: "Assigned to",
              value: id,
              render: <span className="text-midnight">{id}</span>,
            },
          ]
        }
        return [
          {
            label: "Assignment",
            value: "No owner assigned",
            render: (
              <div className="flex flex-col gap-1">
                <span className="italic text-gold">No owner assigned</span>
                <span className="text-xs text-steel font-sans">
                  Assign this finding to someone on your team.
                </span>
              </div>
            ),
          },
        ]
      },
    },
  ],
  // Spec's due-date-first bands. Diverges from v_client_resources'
  // findings_roll (which buckets by classification + abatement_status) —
  // documented in the file header, tracked as NGE-480 v2 follow-up.
  statusFn: (row) => {
    const status = (row.abatement_status as string | null) ?? null
    if (status === "abated" || status === "closed") return "ok"
    if (status === "contested") return "attention"
    const due = (row.abatement_due_date as string | null) ?? null
    if (due) {
      const days = daysUntil(due)
      if (days < 0) return "critical"
      if (days <= 14) return "attention"
    }
    return "ok"
  },
  primaryAction: {
    label: "Log a new finding",
    href: () => `/dashboard/chat?q=${encodeURIComponent("Log a new finding")}`,
  },
}

export const findingsIcon = Warning
