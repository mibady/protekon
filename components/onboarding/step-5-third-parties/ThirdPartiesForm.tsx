"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Send, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import {
  upsertThirdParties,
  requestOnboardingPacket,
} from "@/lib/actions/onboarding/third-parties"
import { advanceStep } from "@/lib/actions/onboarding/state"
import type { ThirdPartyRecordInput } from "@/lib/types/onboarding"

type Row = ThirdPartyRecordInput & {
  localId: string
  packetSent?: boolean
}

type Props = {
  initialRecords: Row[]
  termSingular: string
  termPlural: string
  stepIntro: string
  classificationHelp: string
}

function makeLocalId(): string {
  return `tp-${Math.random().toString(36).slice(2, 10)}`
}

function emptyRow(): Row {
  return {
    localId: makeLocalId(),
    name: "",
    classification: null,
    contactEmail: null,
    contactPhone: null,
    tradeOrCategory: null,
  }
}

export function ThirdPartiesForm({
  initialRecords,
  termSingular,
  termPlural,
  stepIntro,
  classificationHelp,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState<Row[]>(
    initialRecords.length > 0 ? initialRecords : [emptyRow()],
  )

  const updateRow = <K extends keyof ThirdPartyRecordInput>(
    localId: string,
    field: K,
    value: ThirdPartyRecordInput[K],
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.localId === localId ? { ...r, [field]: value } : r)),
    )
  }

  const removeRow = (localId: string) => {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((r) => r.localId !== localId),
    )
  }

  const saveAll = () => {
    const payload: ThirdPartyRecordInput[] = rows
      .filter((r) => r.name.trim().length > 0)
      .map((r) => ({
        id: r.id,
        name: r.name.trim(),
        classification: r.classification,
        contactEmail: r.contactEmail,
        contactPhone: r.contactPhone,
        tradeOrCategory: r.tradeOrCategory,
      }))
    if (payload.length === 0) {
      toast.error(`Add at least one ${termSingular.toLowerCase()}.`)
      return
    }
    startTransition(async () => {
      const result = await upsertThirdParties({ records: payload })
      if (!result.ok) {
        toast.error("Couldn't save. Please try again.")
        return
      }
      toast.success(`${termPlural} saved.`)
      router.refresh()
    })
  }

  const sendPacket = (row: Row) => {
    if (!row.id) {
      toast.error("Save this row before sending a packet.")
      return
    }
    startTransition(async () => {
      const result = await requestOnboardingPacket(row.id as string)
      if (!result.ok) {
        toast.error("Couldn't send the onboarding packet.")
        return
      }
      setRows((prev) =>
        prev.map((r) =>
          r.localId === row.localId ? { ...r, packetSent: true } : r,
        ),
      )
      toast.success("Onboarding packet sent.")
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
      stepNumber={5}
      totalSteps={7}
      title={`${termPlural} you work with`}
      intro={stepIntro}
      backHref="/onboarding/people"
    >
      <div className="flex flex-col gap-6">
        <p className="font-sans text-[13px] text-fog">{classificationHelp}</p>

        {rows.map((row, index) => (
          <fieldset
            key={row.localId}
            className="flex flex-col gap-4 border border-brand-white/[0.1] bg-midnight/40 p-5"
          >
            <legend className="flex items-center justify-between gap-3 px-2">
              <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-steel">
                {termSingular} {index + 1}
                {row.packetSent ? (
                  <Badge variant="secondary" className="ml-3">
                    Packet sent
                  </Badge>
                ) : null}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(row.localId)}
                aria-label={`Remove ${termSingular.toLowerCase()} ${index + 1}`}
                className="text-steel hover:text-crimson"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </legend>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`legal-${row.localId}`}>Legal name</Label>
                <Input
                  id={`legal-${row.localId}`}
                  value={row.name}
                  onChange={(e) => updateRow(row.localId, "name", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`trade-${row.localId}`}>Trade / category</Label>
                <Input
                  id={`trade-${row.localId}`}
                  value={row.tradeOrCategory ?? ""}
                  onChange={(e) =>
                    updateRow(row.localId, "tradeOrCategory", e.target.value || null)
                  }
                  placeholder="Electrical, Plumbing, Staffing..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`classification-${row.localId}`}>Classification</Label>
                <Input
                  id={`classification-${row.localId}`}
                  value={row.classification ?? ""}
                  onChange={(e) =>
                    updateRow(row.localId, "classification", e.target.value || null)
                  }
                  placeholder="Tier 1 / Tier 2 / Specialty"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`email-${row.localId}`}>Primary contact email</Label>
                <Input
                  id={`email-${row.localId}`}
                  type="email"
                  value={row.contactEmail ?? ""}
                  onChange={(e) =>
                    updateRow(row.localId, "contactEmail", e.target.value || null)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`phone-${row.localId}`}>Primary contact phone</Label>
                <Input
                  id={`phone-${row.localId}`}
                  type="tel"
                  value={row.contactPhone ?? ""}
                  onChange={(e) =>
                    updateRow(row.localId, "contactPhone", e.target.value || null)
                  }
                />
              </div>
            </div>

            {row.id ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => sendPacket(row)}
                disabled={isPending || row.packetSent}
                className="self-start gap-2"
              >
                <Send className="h-4 w-4" />
                {row.packetSent ? "Packet sent" : "Request onboarding packet"}
              </Button>
            ) : null}
          </fieldset>
        ))}

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((p) => [...p, emptyRow()])}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {termSingular.toLowerCase()}
          </Button>
          <Button type="button" onClick={saveAll} disabled={isPending}>
            Save all
          </Button>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={continueToNext}
            disabled={isPending}
            className="gap-2"
          >
            <StepFooterNext loading={isPending} label="Continue" />
          </Button>
        </div>
      </div>
    </StepShell>
  )
}
