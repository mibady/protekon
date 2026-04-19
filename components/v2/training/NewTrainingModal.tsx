"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { XCircle } from "@phosphor-icons/react/dist/ssr"
import { addTrainingRecord } from "@/lib/actions/training"
import { TRAINING_TOPICS, getTopicMeta } from "./topics"

type NewTrainingModalProps = {
  open: boolean
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--parchment)",
  border: "1px solid rgba(11, 29, 58, 0.12)",
  padding: "10px 12px",
  fontSize: "13px",
  color: "var(--ink)",
  outline: "none",
}

const labelStyle: React.CSSProperties = {
  color: "var(--steel)",
  fontSize: "10px",
  letterSpacing: "2px",
  fontWeight: 600,
  marginBottom: "6px",
  display: "block",
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function computeDueDate(completedIso: string, years: number): string {
  const d = new Date(completedIso)
  if (Number.isNaN(d.getTime())) return completedIso
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().slice(0, 10)
}

export function NewTrainingModal({ open, onClose }: NewTrainingModalProps) {
  const router = useRouter()
  const [topic, setTopic] = useState<string>(TRAINING_TOPICS[0].topic)
  const [completedAt, setCompletedAt] = useState<string>(todayIso())
  const [trainer, setTrainer] = useState<string>("")
  const [attendees, setAttendees] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const topicMeta = getTopicMeta(topic)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const names = attendees
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (names.length === 0) {
      setError("Enter at least one attendee name.")
      return
    }
    if (!trainer.trim()) {
      setError("Trainer is required.")
      return
    }

    startTransition(async () => {
      try {
        // `addTrainingRecord` takes one employee per call — loop attendees.
        // `due_date` = completion + topic.years (Remix expiration semantics).
        const dueDate = computeDueDate(completedAt, topicMeta.years)
        for (const name of names) {
          const fd = new FormData()
          fd.append("employee_name", name)
          fd.append("training_type", topic)
          fd.append("due_date", dueDate)
          const result = await addTrainingRecord(fd)
          if (result && "error" in result && result.error) {
            setError(result.error)
            return
          }
        }
        router.refresh()
        // Reset + close
        setAttendees("")
        setTrainer("")
        setCompletedAt(todayIso())
        setError(null)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log training.")
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-training-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(11, 29, 58, 0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.12)",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
        }}
      >
        <div
          className="px-6 py-4 flex items-start justify-between"
          style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.08)" }}
        >
          <div>
            <div
              className="font-display uppercase mb-1"
              style={{
                color: "var(--steel)",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
              }}
            >
              Training log
            </div>
            <h2
              id="new-training-title"
              className="font-display"
              style={{ color: "var(--ink)", fontSize: "22px", fontWeight: 700 }}
            >
              Log training
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <XCircle size={22} color="var(--steel)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="mb-4">
            <label htmlFor="training-topic" className="font-display uppercase" style={labelStyle}>
              Topic
            </label>
            <select
              id="training-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={inputStyle}
            >
              {TRAINING_TOPICS.map((t) => (
                <option key={t.topic} value={t.topic}>
                  {t.topic}
                </option>
              ))}
            </select>
            <div
              className="font-sans mt-2"
              style={{ color: "var(--steel)", fontSize: "11px" }}
            >
              {topicMeta.auth} · re-cert every {topicMeta.years}
              {topicMeta.years > 1 ? " years" : " year"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="training-date" className="font-display uppercase" style={labelStyle}>
                Date completed
              </label>
              <input
                id="training-date"
                type="date"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="training-trainer" className="font-display uppercase" style={labelStyle}>
                Trainer
              </label>
              <input
                id="training-trainer"
                type="text"
                value={trainer}
                onChange={(e) => setTrainer(e.target.value)}
                placeholder="Dani Rivera"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="training-attendees" className="font-display uppercase" style={labelStyle}>
              Attendees
            </label>
            <input
              id="training-attendees"
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Dani Rivera, Miguel Ortiz, Sam Chen"
              style={inputStyle}
              required
            />
            <div
              className="font-sans mt-2"
              style={{ color: "var(--steel)", fontSize: "11px" }}
            >
              {/* TODO(wave-6): replace with multi-select backed by workers table */}
              Comma-separated names · one record is created per attendee.
            </div>
          </div>

          <div
            className="p-3 mb-4"
            style={{
              background: "rgba(201, 168, 76, 0.08)",
              borderLeft: "3px solid var(--sand)",
            }}
          >
            <div
              className="font-sans"
              style={{ color: "var(--ink)", fontSize: "12px", lineHeight: 1.5 }}
            >
              <strong>Expiration auto-calculated:</strong> each attendee&apos;s
              record expires {topicMeta.years} year
              {topicMeta.years > 1 ? "s" : ""} from the completion date.
              Protekon will auto-nag 30 days before.
            </div>
          </div>

          {error && (
            <div
              className="p-3 mb-4 font-sans"
              style={{
                background: "rgba(196, 18, 48, 0.08)",
                borderLeft: "3px solid var(--enforcement)",
                color: "var(--enforcement)",
                fontSize: "12px",
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: "1px solid rgba(11, 29, 58, 0.08)" }}
          >
            <span
              className="font-sans italic"
              style={{ color: "var(--steel)", fontSize: "11px" }}
            >
              Records stored for employment + 3 yrs (8 CCR §3203(b))
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 font-display uppercase"
                style={{
                  background: "transparent",
                  color: "var(--steel)",
                  border: "1px solid rgba(11, 29, 58, 0.15)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 font-display uppercase"
                style={{
                  background: "var(--enforcement)",
                  color: "var(--parchment)",
                  border: "none",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                {isPending ? "Logging…" : "Log training"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
