"use client"

/**
 * PendingInvitesTable — unused + unexpired invite tokens.
 * Copy-link uses `window.location.origin + tokenUrl`; Revoke deletes
 * the token row via the server action.
 */

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RoleBadge } from "./RoleBadge"
import { revokeInvite } from "@/lib/actions/team"
import type { PendingInvite } from "@/lib/actions/team"

type PendingInvitesTableProps = {
  pending: PendingInvite[]
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function PendingInvitesTable({ pending }: PendingInvitesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const handleCopy = async (token: string) => {
    const url = `${window.location.origin}/team/invite/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      // eslint-disable-next-line no-alert
      prompt("Copy this invite URL:", url)
    }
  }

  const handleRevoke = (token: string, email: string) => {
    // eslint-disable-next-line no-alert
    if (!confirm(`Revoke the invite for ${email}?`)) return
    startTransition(async () => {
      const res = await revokeInvite(token)
      if (res.error) {
        // eslint-disable-next-line no-alert
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid rgba(11, 29, 58, 0.08)",
      }}
    >
      <div
        className="font-display uppercase"
        style={{
          padding: "12px 16px",
          color: "var(--ink)",
          opacity: 0.7,
          fontSize: 11,
          letterSpacing: 3,
          fontWeight: 600,
          borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
          background: "var(--parchment)",
        }}
      >
        Pending invites · {pending.length}
      </div>
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.08)" }}>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Expires</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {pending.map((p) => (
            <tr
              key={p.token}
              style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.06)" }}
            >
              <Td>
                <span className="font-sans" style={{ color: "var(--ink)", fontSize: 13 }}>
                  {p.email}
                </span>
              </Td>
              <Td>
                <RoleBadge role={p.role} />
              </Td>
              <Td>
                <span className="font-sans" style={{ color: "var(--steel)", fontSize: 12 }}>
                  {fmtDate(p.expires_at)}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(p.token)}
                    className="font-display uppercase"
                    style={{
                      background: "var(--void)",
                      color: "var(--parchment)",
                      border: "none",
                      padding: "6px 10px",
                      fontSize: 10,
                      letterSpacing: 2,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copiedToken === p.token ? "Copied" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRevoke(p.token, p.email)}
                    disabled={isPending}
                    className="font-display uppercase"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(10, 19, 35, 0.15)",
                      color: "var(--enforcement)",
                      padding: "6px 10px",
                      fontSize: 10,
                      letterSpacing: 2,
                      fontWeight: 600,
                      cursor: isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    Revoke
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="font-display uppercase"
      style={{
        textAlign: "left",
        padding: "12px 16px",
        color: "var(--ink)",
        opacity: 0.5,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>{children}</td>
}
