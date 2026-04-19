/**
 * Three-tile header for the Integrations surface:
 *  - Connected systems (void bg, parchment text, col-span-2)
 *  - Data in (white bg, stubbed "—" until sync log lands)
 *  - API access (white bg)
 *
 * Matches the Remix phase5.jsx:422 IntegrationsSurface header grid.
 */
type Props = {
  connected: number
  total: number
}

export function StatsHeader({ connected, total }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
      {/* Connected systems — span 2 */}
      <div
        className="p-5 md:col-span-2"
        style={{
          background: "var(--void)",
          color: "var(--parchment)",
        }}
      >
        <div
          className="font-display uppercase"
          style={{
            color: "var(--sand)",
            fontSize: "10px",
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          Connected systems
        </div>
        <div
          className="font-display"
          style={{
            color: "var(--parchment)",
            fontSize: "48px",
            fontWeight: 800,
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          {connected}
          <span
            style={{
              color: "var(--parchment)",
              opacity: 0.55,
              fontSize: "18px",
              marginLeft: 10,
              fontWeight: 600,
            }}
          >
            / {total}
          </span>
        </div>
        <div
          className="font-sans mt-3"
          style={{
            color: "var(--parchment)",
            opacity: 0.75,
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          All incoming data is normalized and signed into the audit trail. You
          control permissions per integration — you can revoke any connection at
          any time.
        </div>
      </div>

      {/* Data in — stubbed "—" for MVP */}
      {/* TODO(later): wire sync log once per-provider sync jobs ship. */}
      <div
        className="p-5"
        style={{
          background: "var(--parchment)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
      >
        <div
          className="font-display uppercase"
          style={{
            color: "var(--sand)",
            fontSize: "10px",
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          Data in
        </div>
        <div
          className="font-display"
          style={{
            color: "var(--ink)",
            fontSize: "32px",
            fontWeight: 700,
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          —
        </div>
        <div
          className="font-sans mt-1"
          style={{
            color: "var(--steel)",
            fontSize: "11px",
          }}
        >
          records synced this month
        </div>
      </div>

      {/* API access */}
      <div
        className="p-5"
        style={{
          background: "var(--parchment)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
      >
        <div
          className="font-display uppercase"
          style={{
            color: "var(--steel)",
            fontSize: "10px",
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          API access
        </div>
        <div
          className="font-display"
          style={{
            color: "var(--ink)",
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: 1.2,
            marginTop: 6,
          }}
        >
          REST + webhooks
        </div>
        <div
          className="font-sans mt-2"
          style={{
            color: "var(--steel)",
            fontSize: "11px",
          }}
        >
          Build your own integration
        </div>
      </div>
    </div>
  )
}
