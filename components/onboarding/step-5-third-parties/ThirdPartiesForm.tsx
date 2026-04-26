"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Send, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { StepShell } from "@/components/onboarding/StepShell"
import { sendThirdPartyPackets } from "@/lib/actions/onboarding/third-parties"
import { advanceStep } from "@/lib/actions/onboarding/state"
import type { ThirdPartyRecordInput } from "@/lib/types/onboarding"

type Row = Pick<ThirdPartyRecordInput, "id" | "name" | "contactEmail"> & {
  localId: string
  selected: boolean
  queued?: boolean
}

type Props = {
  initialRecords: Row[]
  termSingular: string
  termPlural: string
  stepIntro: string
  classificationHelp: string
  totalSteps: number
}

function makeLocalId(): string {
  return `tp-${Math.random().toString(36).slice(2, 10)}`
}

function emptyRow(): Row {
  return {
    localId: makeLocalId(),
    name: "",
    contactEmail: null,
    selected: true,
  }
}

function hasUsableEmail(value: string | null | undefined): boolean {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
}

export function ThirdPartiesForm({
  initialRecords,
  termSingular,
  termPlural,
  stepIntro,
  totalSteps,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sending, setSending] = useState(false)
  const [rows, setRows] = useState<Row[]>(
    initialRecords.length > 0 ? [...initialRecords, emptyRow()] : [emptyRow()],
  )

  const updateRow = (localId: string, patch: Partial<Row>) => {
    setRows((prev) => {
      const next = prev.map((row) => (row.localId === localId ? { ...row, ...patch } : row))
      const last = next[next.length - 1]
      if (last && (last.name.trim() || hasUsableEmail(last.contactEmail))) {
        next.push(emptyRow())
      }
      return next
    })
  }

  const removeRow = (localId: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.localId !== localId)
      return next.length > 0 ? next : [emptyRow()]
    })
  }

  const filledRows = rows.filter((row) => row.name.trim() || row.contactEmail?.trim())
  const sendableRows = rows.filter(
    (row) => row.selected && row.name.trim() && hasUsableEmail(row.contactEmail) && !row.queued,
  )

  const sendPackets = () => {
    if (sendableRows.length === 0) {
      toast.error(`Add a company name and valid email for at least one ${termSingular.toLowerCase()}.`)
      return
    }

    setSending(true)
    startTransition(async () => {
      const result = await sendThirdPartyPackets({
        records: sendableRows.map((row) => ({
          id: row.id,
          name: row.name.trim(),
          contactEmail: row.contactEmail as string,
        })),
      })

      if (!result.ok) {
        setSending(false)
        toast.error("Couldn't send onboarding packets.")
        return
      }

      const queuedByInput = new Set(sendableRows.map((row) => row.localId))
      setRows((prev) =>
        prev.map((row) =>
          queuedByInput.has(row.localId)
            ? { ...row, queued: true, selected: false }
            : row,
        ),
      )
      setTimeout(() => setSending(false), 500)
      toast.success("Onboarding packets queued.")
      router.refresh()
    })
  }

  const continueToNext = () => {
    startTransition(async () => {
      const result = await advanceStep(5)
      if (!result.ok) {
        toast.error("Couldn't save progress.")
        return
      }
      router.push("/onboarding/documents")
    })
  }

  return (
    <StepShell
      stepNumber={4}
      totalSteps={totalSteps}
      title={`${termPlural} you work with`}
      intro={stepIntro}
      backHref="/onboarding/people"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          {rows.map((row, index) => {
            const isEmpty = !row.name.trim() && !row.contactEmail?.trim()
            return (
              <div
                key={row.localId}
                className={[
                  "grid grid-cols-1 gap-3 border p-3 transition-all md:grid-cols-[32px_1fr_1fr_auto]",
                  row.queued
                    ? "border-green-400/30 bg-green-400/10"
                    : "border-brand-white/[0.1] bg-midnight/40",
                  isEmpty ? "opacity-75" : "opacity-100",
                ].join(" ")}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={row.selected}
                    onCheckedChange={(checked) => updateRow(row.localId, { selected: checked === true })}
                    disabled={row.queued || isEmpty}
                    aria-label={`Select ${termSingular.toLowerCase()} row ${index + 1}`}
                  />
                </div>
                <Input
                  value={row.name}
                  onChange={(e) => updateRow(row.localId, { name: e.target.value })}
                  placeholder="Company Name"
                  className="bg-void"
                  disabled={row.queued}
                />
                <Input
                  type="email"
                  value={row.contactEmail ?? ""}
                  onChange={(e) => updateRow(row.localId, { contactEmail: e.target.value || null })}
                  placeholder="Email Address"
                  className="bg-void"
                  disabled={row.queued}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(row.localId)}
                  className="text-steel hover:text-crimson"
                  disabled={rows.length === 1 || row.queued}
                  aria-label={`Remove ${termSingular.toLowerCase()} row ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>

        {filledRows.length > 0 ? (
          <div className="border border-brand-white/[0.1] bg-midnight/40 p-5">
            <div className="mb-4 font-display text-[12px] tracking-[2px] text-steel uppercase">
              Packet Queue
            </div>
            <ul className="flex flex-col gap-2">
              {filledRows.map((row) => (
                <li
                  key={`summary-${row.localId}`}
                  className={[
                    "flex items-center justify-between border px-3 py-2 font-sans text-[12px]",
                    row.queued
                      ? "border-green-400/30 text-green-400"
                      : "border-brand-white/[0.08] text-fog",
                  ].join(" ")}
                >
                  <span>{row.name || "Unnamed company"}</span>
                  <span>{row.queued ? "Queued" : row.contactEmail || "Email needed"}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            onClick={sendPackets}
            disabled={isPending || sendableRows.length === 0}
            className="gap-2 border border-gold bg-midnight text-gold hover:bg-gold/10"
          >
            <Send className={["h-4 w-4 transition-transform", sending ? "translate-x-3 -translate-y-2" : ""].join(" ")} />
            Send Onboarding Packets
          </Button>
          <Button type="button" onClick={continueToNext} disabled={isPending} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepShell>
  )
}
