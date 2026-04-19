type Props = {
  metric: string
  you: number
  peer: number | null
  max: number
  better: boolean
  unit?: string
  note?: string
}

/**
 * Horizontal benchmark bar. Ports Remix phase4.jsx:97.
 * - `better=true` means higher is better; if `you > peer`, bar shows steel (good).
 * - `better=false` means lower is better; if `you < peer`, bar shows steel (good).
 * - Peer value rendered as a vertical tick inside the bar.
 * - If `peer` is null, only shows your value (no comparison tick) with a
 *   "peer data pending" label.
 */
export function BenchmarkBar({ metric, you, peer, max, better, unit = "", note }: Props) {
  const safeMax = max > 0 ? max : Math.max(you, peer ?? 0, 1)
  const youW = Math.min(100, Math.max(0, (you / safeMax) * 100))
  const peerW = peer !== null ? Math.min(100, Math.max(0, (peer / safeMax) * 100)) : null

  const youBeatsPeer =
    peer === null ? true : better ? you >= peer : you <= peer
  const youColor = youBeatsPeer ? "var(--steel)" : "var(--enforcement)"

  return (
    <div className="py-3" style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.06)" }}>
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <div className="flex-1">
          <div
            className="font-display"
            style={{ color: "var(--ink)", fontSize: "14px", fontWeight: 600 }}
          >
            {metric}
          </div>
          {note ? (
            <div
              className="font-sans"
              style={{ color: "var(--steel)", fontSize: "12px", marginTop: "2px" }}
            >
              {note}
            </div>
          ) : null}
        </div>
        <div className="font-display text-right" style={{ color: youColor, fontSize: "15px", fontWeight: 700 }}>
          You {you}
          {unit}
          {peer !== null ? (
            <span
              className="font-sans ml-2"
              style={{ color: "var(--steel)", fontSize: "12px", fontWeight: 400 }}
            >
              vs peer {peer}
              {unit}
            </span>
          ) : (
            <span
              className="font-sans ml-2"
              style={{ color: "var(--steel)", fontSize: "11px", letterSpacing: "1px" }}
            >
              peer data pending
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          height: "10px",
          background: "rgba(11, 29, 58, 0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${youW}%`,
            background: youColor,
          }}
        />
        {peerW !== null ? (
          <div
            style={{
              position: "absolute",
              top: "-2px",
              left: `${peerW}%`,
              width: "2px",
              height: "14px",
              background: "var(--ink)",
            }}
            aria-label={`peer benchmark ${peer}${unit}`}
          />
        ) : null}
      </div>
    </div>
  )
}
