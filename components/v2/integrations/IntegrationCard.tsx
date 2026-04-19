"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Plug, PlugsConnected, Link as LinkIcon } from "@phosphor-icons/react/dist/ssr"
import type { IntegrationRow } from "@/lib/actions/integrations"
import { DisconnectButton } from "./DisconnectButton"

type Props = {
  integration: IntegrationRow
}

function fmtLastSync(iso: string | null): string {
  if (!iso) return "Just now"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Integration card — 3 states derived from connected + status:
 *  - connected    → sand accent, CONNECTED pill, account + lastSync, Manage button
 *  - available    → steel accent, AVAILABLE pill, Connect → /api/integrations/:id/authorize
 *  - coming_soon  → steel accent (dimmed), COMING SOON pill, Connect → toast.info
 *
 * Mirrors the Remix phase5.jsx:378 IntegrationCard layout.
 */
export function IntegrationCard({ integration }: Props) {
  const isConnected = integration.connected === true
  const isComingSoon = integration.status === "coming_soon"

  const accentColor = isConnected
    ? "var(--sand)"
    : isComingSoon
    ? "rgba(122, 143, 165, 0.4)"
    : "var(--steel)"

  const statusLabel = isConnected
    ? "CONNECTED"
    : isComingSoon
    ? "COMING SOON"
    : "AVAILABLE"

  const statusColor = isConnected ? "var(--sand)" : "var(--steel)"
  const statusBg = isConnected
    ? "rgba(201, 168, 76, 0.14)"
    : "rgba(122, 143, 165, 0.12)"

  return (
    <div
      className="p-5 flex flex-col"
      style={{
        background: "var(--parchment)",
        border: "1px solid rgba(11, 29, 58, 0.08)",
        borderLeft: `3px solid ${accentColor}`,
        opacity: isComingSoon ? 0.82 : 1,
      }}
    >
      {/* Top row: category eyebrow + status pill */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div
          className="font-display uppercase inline-flex items-center gap-1"
          style={{
            color: "var(--steel)",
            fontSize: "9px",
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          {isConnected ? (
            <PlugsConnected size={10} weight="bold" />
          ) : (
            <Plug size={10} weight="bold" />
          )}
          {integration.category}
        </div>
        <span
          className="font-display uppercase"
          style={{
            color: statusColor,
            background: statusBg,
            padding: "2px 6px",
            fontSize: "9px",
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Provider name */}
      <div
        className="font-display"
        style={{
          color: "var(--ink)",
          fontSize: "17px",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {integration.name}
      </div>

      {/* Note */}
      <div
        className="font-sans"
        style={{
          color: "var(--steel)",
          fontSize: "12px",
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {integration.note}
      </div>

      {/* Connected footer: account label + last sync */}
      {isConnected ? (
        <div
          className="mt-3 pt-3"
          style={{ borderTop: "1px solid rgba(11, 29, 58, 0.06)" }}
        >
          <div
            className="font-sans inline-flex items-center gap-1"
            style={{ color: "var(--steel)", fontSize: "11px" }}
          >
            <LinkIcon size={10} weight="bold" />
            {integration.accountLabel ?? "Connected account"}
          </div>
          <div
            className="font-sans"
            style={{
              color: "var(--steel)",
              fontSize: "11px",
              marginTop: 2,
            }}
          >
            Last sync · {fmtLastSync(integration.lastSyncAt)}
          </div>
          {integration.errorMessage ? (
            <div
              className="font-sans mt-2"
              style={{
                color: "var(--enforcement)",
                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              {integration.errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Bottom button */}
      <div className="mt-4">
        {isConnected ? (
          <DisconnectButton
            providerId={integration.id}
            providerName={integration.name}
          />
        ) : isComingSoon ? (
          <button
            type="button"
            onClick={() =>
              toast.info("Coming soon — this provider is on the roadmap.")
            }
            className="px-3 py-2 font-display uppercase"
            style={{
              background: "transparent",
              color: "var(--ink)",
              border: "1px solid rgba(11, 29, 58, 0.15)",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              alignSelf: "flex-start",
            }}
          >
            Connect
          </button>
        ) : (
          <Link
            href={`/api/integrations/${integration.id}/authorize`}
            className="px-3 py-2 font-display uppercase inline-flex items-center"
            style={{
              background: "var(--enforcement)",
              color: "var(--parchment)",
              border: "none",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
              alignSelf: "flex-start",
            }}
          >
            Connect
          </Link>
        )}
      </div>
    </div>
  )
}
