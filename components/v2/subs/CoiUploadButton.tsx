"use client"

import { useRouter } from "next/navigation"
import { UploadSimple } from "@phosphor-icons/react/dist/ssr"
import CoiUploadDialog from "@/components/dashboard/CoiUploadDialog"

type CoiUploadButtonProps = {
  subId: string
  subName: string
}

/**
 * Thin per-sub wrapper around the shipped CoiUploadDialog.
 *
 * Reuses `components/dashboard/CoiUploadDialog.tsx` as-is (see its Props:
 * { subId, subName, onUploaded?, trigger? }). We only pass a custom
 * `trigger` in the brand's uppercase-tracked style and refresh the router
 * on upload so the records list and summary tiles both re-query.
 */
export function CoiUploadButton({ subId, subName }: CoiUploadButtonProps) {
  const router = useRouter()

  const trigger = (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-display uppercase"
      style={{
        color: "var(--ink)",
        fontSize: "11px",
        letterSpacing: "2px",
        fontWeight: 600,
        background: "transparent",
        border: "1px solid rgba(10, 19, 35, 0.15)",
        padding: "6px 10px",
        cursor: "pointer",
      }}
    >
      <UploadSimple size={12} weight="bold" /> Upload COI
    </button>
  )

  return (
    <CoiUploadDialog
      subId={subId}
      subName={subName}
      trigger={trigger}
      onUploaded={() => router.refresh()}
    />
  )
}
