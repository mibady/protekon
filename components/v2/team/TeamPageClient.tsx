"use client"

/**
 * TeamPageClient — composite orchestrator for /dashboard/team.
 * Owns modal state; derives `isOwner` client-side from the current user's
 * row in `members` so only owners see the "Invite teammate" CTA.
 */

import { useMemo, useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { TeamTable } from "./TeamTable"
import { PendingInvitesTable } from "./PendingInvitesTable"
import { InviteMemberModal } from "./InviteMemberModal"
import type { TeamMember, PendingInvite } from "@/lib/actions/team"

type TeamPageClientProps = {
  members: TeamMember[]
  pending: PendingInvite[]
  currentUserId: string
}

export function TeamPageClient({
  members,
  pending,
  currentUserId,
}: TeamPageClientProps) {
  const [inviteOpen, setInviteOpen] = useState(false)

  const isOwner = useMemo(() => {
    const me = members.find((m) => m.user_id === currentUserId)
    return (
      me?.role === "owner" && !me.deactivated_at && Boolean(me.activated_at)
    )
  }, [members, currentUserId])

  return (
    <div className="px-10 pb-16">
      {isOwner && (
        <div className="flex items-center justify-end mb-6">
          <CTAButton onClick={() => setInviteOpen(true)}>
            Invite teammate
          </CTAButton>
        </div>
      )}

      <div className="mb-8">
        <TeamTable members={members} currentUserId={currentUserId} />
      </div>

      {pending.length > 0 && <PendingInvitesTable pending={pending} />}

      {isOwner && (
        <InviteMemberModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  )
}
