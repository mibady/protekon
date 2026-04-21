"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import { upsertSites, deleteSite } from "@/lib/actions/onboarding/sites"
import { advanceStep } from "@/lib/actions/onboarding/state"
import type { SiteUpsertInput } from "@/lib/types/onboarding"

type SiteRow = SiteUpsertInput & { localId: string }

type Props = {
  initialSites: SiteRow[]
  operatingStates: string[]
  stepIntro: string
  addButtonLabel: string
}

function makeLocalId(): string {
  return `new-${Math.random().toString(36).slice(2, 10)}`
}

function emptyRow(isPrimary: boolean): SiteRow {
  return {
    localId: makeLocalId(),
    name: "",
    address: null,
    city: null,
    state: null,
    zip: null,
    employeeCount: null,
    isPrimary,
  }
}

export function SitesForm({
  initialSites,
  operatingStates,
  stepIntro,
  addButtonLabel,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState<SiteRow[]>(
    initialSites.length > 0 ? initialSites : [emptyRow(true)],
  )

  const updateRow = <K extends keyof SiteUpsertInput>(
    localId: string,
    field: K,
    value: SiteUpsertInput[K],
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.localId === localId ? { ...r, [field]: value } : r)),
    )
  }

  const setPrimary = (localId: string) => {
    setRows((prev) =>
      prev.map((r) => ({ ...r, isPrimary: r.localId === localId })),
    )
  }

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(prev.length === 0)])
  }

  const removeRow = (row: SiteRow) => {
    if (rows.length === 1) {
      toast.error("You need at least one site.")
      return
    }

    const applyLocalRemove = () => {
      setRows((prev) => {
        const next = prev.filter((r) => r.localId !== row.localId)
        if (!next.some((r) => r.isPrimary) && next.length > 0) {
          next[0] = { ...next[0], isPrimary: true }
        }
        return next
      })
    }

    if (!row.id) {
      applyLocalRemove()
      return
    }

    startTransition(async () => {
      const result = await deleteSite(row.id as string)
      if (!result.ok) {
        toast.error("Couldn't delete that site. Please try again.")
        return
      }
      applyLocalRemove()
      toast.success("Site removed.")
      router.refresh()
    })
  }

  const hasPrimary = rows.some((r) => r.isPrimary)
  const allNamed = rows.every((r) => r.name.trim().length > 0)
  const canSubmit = hasPrimary && allNamed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    const payload: SiteUpsertInput[] = rows.map((r) => ({
      id: r.id,
      name: r.name.trim(),
      address: r.address?.trim() ? r.address.trim() : null,
      city: r.city?.trim() ? r.city.trim() : null,
      state: r.state,
      zip: r.zip?.trim() ? r.zip.trim() : null,
      employeeCount: r.employeeCount,
      isPrimary: r.isPrimary,
    }))

    startTransition(async () => {
      const result = await upsertSites({ sites: payload })
      if (!result.ok) {
        toast.error("Couldn't save sites. Please try again.")
        return
      }
      const advance = await advanceStep(3)
      if (!advance.ok) {
        toast.error("Sites saved, but couldn't advance the wizard.")
        return
      }
      toast.success("Sites saved.")
      router.push("/onboarding/people")
    })
  }

  const stateOptions =
    operatingStates.length > 0 ? operatingStates : ([] as string[])

  return (
    <form onSubmit={handleSubmit}>
      <StepShell
        stepNumber={3}
        totalSteps={7}
        title="Where do you operate?"
        intro={stepIntro}
        backHref="/onboarding/tools"
      >
        <div className="flex flex-col gap-6">
          {rows.map((row, index) => (
            <fieldset
              key={row.localId}
              className="flex flex-col gap-4 border border-brand-white/[0.1] bg-midnight/40 p-5"
            >
              <legend className="flex items-center justify-between gap-3 px-2">
                <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-steel">
                  Site {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(row)}
                  aria-label={`Remove site ${index + 1}`}
                  className="gap-2 text-steel hover:text-crimson"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </legend>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor={`name-${row.localId}`}>Site name</Label>
                  <Input
                    id={`name-${row.localId}`}
                    value={row.name}
                    onChange={(e) => updateRow(row.localId, "name", e.target.value)}
                    placeholder="Headquarters / Jobsite A / Clinic North"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor={`address-${row.localId}`}>Street address</Label>
                  <Input
                    id={`address-${row.localId}`}
                    value={row.address ?? ""}
                    onChange={(e) =>
                      updateRow(row.localId, "address", e.target.value || null)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`city-${row.localId}`}>City</Label>
                  <Input
                    id={`city-${row.localId}`}
                    value={row.city ?? ""}
                    onChange={(e) =>
                      updateRow(row.localId, "city", e.target.value || null)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`state-${row.localId}`}>State</Label>
                  <Select
                    value={row.state ?? ""}
                    onValueChange={(val) =>
                      updateRow(row.localId, "state", val || null)
                    }
                  >
                    <SelectTrigger id={`state-${row.localId}`}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`zip-${row.localId}`}>ZIP</Label>
                  <Input
                    id={`zip-${row.localId}`}
                    value={row.zip ?? ""}
                    onChange={(e) =>
                      updateRow(row.localId, "zip", e.target.value || null)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`employee-${row.localId}`}>Workers at this site</Label>
                  <Input
                    id={`employee-${row.localId}`}
                    type="number"
                    min={0}
                    value={row.employeeCount ?? ""}
                    onChange={(e) =>
                      updateRow(
                        row.localId,
                        "employeeCount",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3 border border-brand-white/[0.1] px-3 py-2 md:col-span-2">
                  <Label
                    htmlFor={`primary-${row.localId}`}
                    className="cursor-pointer"
                  >
                    Primary site
                  </Label>
                  <Switch
                    id={`primary-${row.localId}`}
                    checked={row.isPrimary}
                    onCheckedChange={(checked) => {
                      if (checked) setPrimary(row.localId)
                    }}
                    aria-label="Mark as primary site"
                  />
                </div>
              </div>
            </fieldset>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            className="self-start gap-2"
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>

          <div className="flex justify-end">
            <StepFooterNext
              disabled={!canSubmit || isPending}
              loading={isPending}
              label="Save sites"
            />
          </div>
        </div>
      </StepShell>
    </form>
  )
}
