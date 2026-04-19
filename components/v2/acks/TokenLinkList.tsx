"use client"

import { useState } from "react"

/**
 * Renders the list of tokenised acknowledgment URLs returned by
 * createAckCampaign — each one is a single-use link the owner can
 * distribute by email, SMS, or QR code.
 *
 * urls are emitted by the action as `/ack/<token>` — this component
 * turns them into absolute URLs (using window.location.origin) at copy
 * time so the recipient gets a usable link.
 */
type TokenLinkListProps = {
  urls: string[]
}

export function TokenLinkList({ urls }: TokenLinkListProps) {
  const [copied, setCopied] = useState<number | null>(null)

  if (urls.length === 0) return null

  function toAbsolute(relativeOrAbsolute: string): string {
    if (typeof window === "undefined") return relativeOrAbsolute
    if (/^https?:/i.test(relativeOrAbsolute)) return relativeOrAbsolute
    return `${window.location.origin}${relativeOrAbsolute}`
  }

  async function handleCopy(i: number, url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(toAbsolute(url))
      setCopied(i)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Clipboard blocked — no-op
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: "11px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        Single-use links ({urls.length})
      </div>
      {urls.map((u, i) => (
        <div
          key={u}
          className="flex items-center gap-2"
          style={{
            background: "var(--parchment)",
            border: "1px solid rgba(11, 29, 58, 0.08)",
            padding: "8px 12px",
          }}
        >
          <code
            className="font-sans flex-1 truncate"
            style={{
              color: "var(--ink)",
              opacity: 0.8,
              fontSize: "12px",
            }}
          >
            {toAbsolute(u)}
          </code>
          <button
            type="button"
            onClick={() => handleCopy(i, u)}
            className="font-display uppercase"
            style={{
              color: "var(--ink)",
              fontSize: "11px",
              letterSpacing: "2px",
              fontWeight: 600,
              padding: "4px 8px",
              border: "1px solid rgba(10, 19, 35, 0.15)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {copied === i ? "Copied" : "Copy"}
          </button>
        </div>
      ))}
    </div>
  )
}
