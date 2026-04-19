"use client"

import { useState, useTransition } from "react"
import { updateNotificationPreferences } from "@/lib/actions/settings"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

const PREF_LABELS: Record<string, { label: string; hint: string }> = {
  regulatory_updates: {
    label: "Regulatory updates",
    hint: "New rules, deadline changes, enforcement bulletins.",
  },
  document_reminders: {
    label: "Document reminders",
    hint: "When a plan is due for annual review or expiring.",
  },
  weekly_summaries: {
    label: "Weekly summary",
    hint: "Monday briefing with the week ahead.",
  },
  incident_alerts: {
    label: "Incident alerts",
    hint: "Real-time when someone logs a recordable.",
  },
  marketing_emails: {
    label: "Product news",
    hint: "Occasional updates from Protekon (opt-in).",
  },
}

type NotificationsTabProps = {
  prefs: Record<string, boolean>
}

export function NotificationsTab({ prefs }: NotificationsTabProps) {
  const [state, setState] = useState<Record<string, boolean>>({ ...prefs })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function toggle(key: string) {
    setState((s) => ({ ...s, [key]: !s[key] }))
  }

  function handleSave() {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await updateNotificationPreferences(state)
      if (result.error) setError(result.error)
      else setMessage("Notification preferences saved.")
    })
  }

  const keys = Object.keys({ ...PREF_LABELS, ...state })
  const uniqueKeys = Array.from(new Set(keys))

  return (
    <div className="space-y-6">
      <div
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          fontSize: "11px",
          letterSpacing: "3px",
          fontWeight: 600,
          borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
          paddingBottom: "0.5rem",
        }}
      >
        Notifications
      </div>

      <ul className="divide-y" style={{ borderColor: "rgba(11, 29, 58, 0.06)" }}>
        {uniqueKeys.map((key) => {
          const meta = PREF_LABELS[key] ?? { label: key, hint: "" }
          return (
            <li
              key={key}
              className="flex items-start justify-between gap-6 py-4"
            >
              <div>
                <div
                  className="font-sans"
                  style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
                >
                  {meta.label}
                </div>
                {meta.hint && (
                  <div
                    className="font-sans mt-1"
                    style={{ color: "var(--steel)", fontSize: "13px" }}
                  >
                    {meta.hint}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={state[key] ?? false}
                  onChange={() => toggle(key)}
                />
                <span
                  className="font-display uppercase"
                  style={{
                    color: "var(--steel)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                  }}
                >
                  {state[key] ? "On" : "Off"}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {error && (
        <div
          className="font-sans"
          style={{ color: "var(--enforcement)", fontSize: "13px" }}
        >
          {error}
        </div>
      )}
      {message && (
        <div
          className="font-sans"
          style={{ color: "var(--steel)", fontSize: "13px" }}
        >
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <CTAButton onClick={handleSave} icon={false} disabled={pending}>
          {pending ? "Saving…" : "Save preferences"}
        </CTAButton>
      </div>
    </div>
  )
}
