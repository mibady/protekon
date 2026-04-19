import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { CalendarEvent, CalendarEventType } from "@/lib/actions/calendar"

type CalendarListProps = {
  events: CalendarEvent[]
}

const TYPE_LABEL: Record<CalendarEventType, string> = {
  training: "Training",
  document: "Document",
  regulatory: "Regulatory",
  certification: "Certification",
}

function statusTone(status: string): "enforcement" | "sand" | "steel" {
  if (status === "overdue") return "enforcement"
  if (status === "upcoming") return "sand"
  return "steel"
}

function monthKey(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" })
}

function formatDay(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

export function CalendarList({ events }: CalendarListProps) {
  if (events.length === 0) {
    return (
      <div
        className="py-10 text-center font-sans"
        style={{ color: "var(--steel)", fontSize: "14px" }}
      >
        No deadlines on the horizon. Your calendar is clear.
      </div>
    )
  }

  // Group events by month
  const months = new Map<string, CalendarEvent[]>()
  for (const ev of events) {
    const key = monthKey(ev.date)
    const bucket = months.get(key) ?? []
    bucket.push(ev)
    months.set(key, bucket)
  }

  return (
    <div className="space-y-10">
      {Array.from(months.entries()).map(([month, monthEvents]) => (
        <section key={month}>
          <div
            className="flex items-baseline gap-3 mb-5"
            style={{ borderBottom: "2px solid var(--void)", paddingBottom: "0.75rem" }}
          >
            <h2
              className="font-display"
              style={{
                color: "var(--ink)",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              {month}
            </h2>
            <span
              className="font-display uppercase"
              style={{
                color: "var(--steel)",
                fontSize: "10px",
                letterSpacing: "2px",
              }}
            >
              {monthEvents.length} {monthEvents.length === 1 ? "event" : "events"}
            </span>
          </div>

          <ul className="divide-y" style={{ borderColor: "rgba(11, 29, 58, 0.06)" }}>
            {monthEvents.map((ev) => (
              <li key={ev.id} className="flex items-start gap-4 py-4">
                <div
                  className="font-display flex-shrink-0"
                  style={{
                    color: "var(--ink)",
                    fontSize: "13px",
                    fontWeight: 600,
                    width: "110px",
                  }}
                >
                  {formatDay(ev.date)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <PriorityPill tone={statusTone(ev.status)}>
                      {ev.status}
                    </PriorityPill>
                    <span
                      className="font-display uppercase"
                      style={{
                        color: "var(--steel)",
                        fontSize: "10px",
                        letterSpacing: "2px",
                      }}
                    >
                      {TYPE_LABEL[ev.type]}
                    </span>
                  </div>
                  <div
                    className="font-sans"
                    style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
                  >
                    {ev.title}
                  </div>
                  {ev.detail && (
                    <div
                      className="font-sans mt-1"
                      style={{ color: "var(--steel)", fontSize: "13px" }}
                    >
                      {ev.detail}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
