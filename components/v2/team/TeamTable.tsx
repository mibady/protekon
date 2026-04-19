"use client"

/**
 * TeamTable — roster for a client's activated + deactivated teammates.
 * Ported from Remix phase5.jsx:164 TeamPermissionsSurface.
 * Non-self rows expose a role select + Deactivate action; mutations route
 * through the server actions and `router.refresh()` reloads the page data.
 */

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { RoleBadge } from "./RoleBadge"
import type { TeamMember } from "@/lib/actions/team"
import { assignRole, deactivateTeammate } from "@/lib/actions/team"
import type { UserRole } from "@/lib/auth/roles"

type TeamTableProps = {
  members: TeamMember[]
  currentUserId: string
}

const ROLE_OPTIONS: UserRole[] = [
  "owner",
  "compliance_manager",
  "field_lead",
  "auditor",
]

function nameFromEmail(email: string | null): string {
  if (!email) return "(no email on file)"
  const local = email.split("@")[0] ?? email
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ") || email
}

function statusFor(m: TeamMember): {
  label: string
  tone: "enforcement" | "sand" | "steel"
} {
  if (m.deactivated_at) return { label: "DEACTIVATED", tone: "steel" }
  if (!m.activated_at) return { label: "PENDING", tone: "sand" }
  return { label: "ACTIVE", tone: "steel" }
}

export function TeamTable({ members, currentUserId }: TeamTableProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, role: UserRole) => {
    startTransition(async () => {
      const res = await assignRole(userId, role)
      if (res.error) {
        // eslint-disable-next-line no-alert
        alert(res.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleDeactivate = (userId: string, email: string | null) => {
    // eslint-disable-next-line no-alert
    if (!confirm(`Deactivate ${email ?? "this teammate"}? They'll lose access immediately.`)) {
      return
    }
    startTransition(async () => {
      const res = await deactivateTeammate(userId)
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
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.08)" }}>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="font-sans"
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--steel)",
                  fontSize: 13,
                }}
              >
                No teammates yet. Invite someone to get started.
              </td>
            </tr>
          ) : (
            members.map((m) => {
              const isSelf = m.user_id === currentUserId
              const status = statusFor(m)
              const isDeactivated = Boolean(m.deactivated_at)
              return (
                <tr
                  key={m.user_id}
                  style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.06)" }}
                >
                  <Td>
                    <span className="font-sans" style={{ color: "var(--ink)", fontWeight: 600 }}>
                      {nameFromEmail(m.email)}
                      {isSelf && (
                        <span
                          className="font-display uppercase ml-2"
                          style={{
                            color: "var(--steel)",
                            fontSize: 10,
                            letterSpacing: 2,
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-sans" style={{ color: "var(--ink)", opacity: 0.75, fontSize: 13 }}>
                      {m.email ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <RoleBadge role={m.role} />
                  </Td>
                  <Td>
                    <PriorityPill tone={status.tone}>{status.label}</PriorityPill>
                  </Td>
                  <Td>
                    {isSelf || isDeactivated ? (
                      <span
                        className="font-sans italic"
                        style={{ color: "var(--steel)", fontSize: 12 }}
                      >
                        {isDeactivated ? "No actions" : "—"}
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <select
                          value={m.role}
                          disabled={pending}
                          onChange={(e) =>
                            handleRoleChange(m.user_id, e.target.value as UserRole)
                          }
                          className="font-sans"
                          style={{
                            background: "var(--parchment)",
                            border: "1px solid rgba(11, 29, 58, 0.15)",
                            padding: "6px 8px",
                            fontSize: 12,
                            color: "var(--ink)",
                            cursor: pending ? "not-allowed" : "pointer",
                          }}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(m.user_id, m.email)}
                          disabled={pending}
                          className="font-display uppercase"
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(10, 19, 35, 0.15)",
                            color: "var(--enforcement)",
                            padding: "6px 10px",
                            fontSize: 10,
                            letterSpacing: 2,
                            fontWeight: 600,
                            cursor: pending ? "not-allowed" : "pointer",
                          }}
                        >
                          Deactivate
                        </button>
                      </div>
                    )}
                  </Td>
                </tr>
              )
            })
          )}
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
