/**
 * RetentionAlerts — ported from dashboard.jsx:633.
 * White card with a "Up Next" list of documents approaching retention expiry.
 */

import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import { RETENTION_ALERTS } from "../mocks"

export function RetentionAlerts() {
  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid rgba(11,29,58,0.08)",
        padding: "20px 22px",
      }}
    >
      <SectionLabel>Retention Alerts · Up Next</SectionLabel>
      <ul className="flex flex-col" style={{ gap: 10 }}>
        {RETENTION_ALERTS.map((a, i) => (
          <li
            key={a.doc}
            className="flex items-start gap-3 pb-3"
            style={{
              borderBottom:
                i === RETENTION_ALERTS.length - 1 ? "none" : "1px solid rgba(11,29,58,0.06)",
            }}
          >
            <div
              className="font-display uppercase flex-shrink-0"
              style={{
                color: "var(--sand)",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
                minWidth: 54,
              }}
            >
              {a.bucket}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-sans"
                style={{ color: "var(--midnight)", fontSize: "13px", fontWeight: 500 }}
              >
                {a.doc}
              </div>
              <div className="font-sans" style={{ color: "var(--steel)", fontSize: "11px", marginTop: 2 }}>
                {a.authority}
              </div>
            </div>
            <div
              className="font-display uppercase flex-shrink-0"
              style={{ color: "var(--enforcement)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
            >
              {a.due_in}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
