"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { disconnectIntegration } from "@/lib/actions/integrations"

type Props = {
  providerId: string
  providerName: string
}

/**
 * Inline "Manage" affordance for connected providers.
 *
 * Opens a confirmation modal (same ModalShell pattern used in W1 acks).
 * On confirm, calls `disconnectIntegration(providerId)` in a transition,
 * then refreshes the route so the card flips back to Available.
 */
export function DisconnectButton({ providerId, providerName }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClose(): void {
    if (isPending) return
    setOpen(false)
    setError(null)
  }

  function handleConfirm(): void {
    setError(null)
    startTransition(async () => {
      const res = await disconnectIntegration(providerId)
      if (res.error) {
        setError(res.error)
        return
      }
      toast.success(`${providerName} disconnected.`)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
        Manage
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(7, 15, 30, 0.7)" }}
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--parchment)",
              border: "1px solid rgba(11, 29, 58, 0.08)",
            }}
          >
            <div className="p-6">
              <div
                className="font-display uppercase mb-3"
                style={{
                  color: "var(--ink)",
                  opacity: 0.5,
                  fontSize: "11px",
                  letterSpacing: "3px",
                  fontWeight: 500,
                }}
              >
                DISCONNECT INTEGRATION
              </div>
              <h2
                className="font-display tracking-tight mb-4"
                style={{
                  color: "var(--ink)",
                  fontSize: "22px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Disconnect {providerName}?
              </h2>
              <p
                className="font-sans mb-5"
                style={{
                  color: "var(--ink)",
                  opacity: 0.75,
                  fontSize: "14px",
                  lineHeight: 1.55,
                }}
              >
                Protekon will stop pulling data from {providerName}. Your stored
                tokens will be cleared. You can reconnect at any time — the
                audit trail will record this change.
              </p>

              {error ? (
                <div
                  className="font-sans mb-4 px-3 py-2"
                  style={{
                    background: "rgba(198, 40, 40, 0.08)",
                    color: "var(--enforcement)",
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="px-4 py-2 font-display uppercase"
                  style={{
                    background: "var(--enforcement)",
                    color: "var(--parchment)",
                    border: "none",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  {isPending ? "Disconnecting…" : "Disconnect"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-4 py-2 font-display uppercase"
                  style={{
                    background: "transparent",
                    color: "var(--ink)",
                    border: "1px solid rgba(11, 29, 58, 0.15)",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
