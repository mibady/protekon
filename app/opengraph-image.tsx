import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "PROTEKON — AI Compliance Officer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0B1D3A",
          position: "relative",
        }}
      >
        {/* Top crimson accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#C41230" }} />

        {/* P-mark */}
        <svg viewBox="0 0 48 84" width={64} height={112} style={{ marginBottom: 32 }}>
          <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
          <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
          <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
          <rect x="0" y="40" width="48" height="10" fill="#C41230" />
        </svg>

        {/* Brand name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: 12,
            color: "#FAFAF8",
            display: "flex",
          }}
        >
          PROT
          <span style={{ color: "#C41230" }}>E</span>
          KON
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            letterSpacing: 6,
            color: "#C9A84C",
            marginTop: 16,
          }}
        >
          AI COMPLIANCE OFFICER
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 18,
            color: "#7A8FA5",
            marginTop: 32,
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Workplace compliance as a service — IIPP, SB 553, incident logging, and regulatory monitoring.
        </div>
      </div>
    ),
    { ...size }
  )
}
