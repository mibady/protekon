"use client"

/**
 * AcceptForm — final "Accept invite" click on the public /team/invite/[token]
 * landing. Calls acceptTeamInvite(token) via useTransition and redirects to
 * /dashboard on success.
 */

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { Card } from "@/components/v2/primitives/Card"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { RoleBadge } from "./RoleBadge"
import { acceptTeamInvite } from "@/lib/actions/team"
import type { UserRole } from "@/lib/auth/roles"

type AcceptFormProps = {
  token: string
  email: string
  role: UserRole
}

export function AcceptForm({ token, email, role }: AcceptFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleAccept = () => {
    setError(null)
    startTransition(async () => {
      const res = await acceptTeamInvite(token)
      if (res.error) {
        setError(res.error)
        return
      }
      router.push("/dashboard")
    })
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "var(--parchment)" }}
    >
      <div className="w-full max-w-lg">
        <Card accent="enforcement" padding="p-8">
          <PageHeader
            eyebrow="PROTEKON · TEAM INVITE"
            title="Join the team."
            subtitle={`Accept to activate your ${role.replace(/_/g, " ")} access.`}
          />
          <div className="mb-6">
            <div
              className="font-display uppercase mb-2"
              style={{
                color: "var(--ink)",
                opacity: 0.5,
                fontSize: 11,
                letterSpacing: 3,
                fontWeight: 600,
              }}
            >
              Invited as
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="font-sans"
                style={{ color: "var(--ink)", fontSize: 15 }}
              >
                {email}
              </span>
              <RoleBadge role={role} />
            </div>
          </div>

          {error && (
            <div
              className="font-sans mb-4"
              style={{
                color: "var(--enforcement)",
                fontSize: 13,
                background: "rgba(196, 57, 43, 0.08)",
                border: "1px solid rgba(196, 57, 43, 0.25)",
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end">
            <CTAButton onClick={handleAccept} disabled={isPending}>
              {isPending ? "Accepting…" : "Accept invite"}
            </CTAButton>
          </div>
        </Card>
      </div>
    </main>
  )
}
