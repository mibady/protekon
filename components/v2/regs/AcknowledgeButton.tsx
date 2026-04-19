"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { acknowledgeRegulation } from "@/lib/actions/reports"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

type Props = {
  regulationId: string
  disabled?: boolean
}

/**
 * Client button that calls `acknowledgeRegulation` server action and
 * refreshes the route. Used on the Regulatory Changes surface.
 */
export function AcknowledgeButton({ regulationId, disabled = false }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = (): void => {
    setError(null)
    startTransition(async () => {
      const result = await acknowledgeRegulation(regulationId)
      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <CTAButton
        onClick={handleClick}
        disabled={disabled || isPending}
        variant="ghost"
        icon={false}
      >
        {isPending ? "Acknowledging…" : "Acknowledge"}
      </CTAButton>
      {error ? (
        <span
          className="font-sans"
          style={{ color: "var(--enforcement)", fontSize: "11px" }}
        >
          {error}
        </span>
      ) : null}
    </div>
  )
}
