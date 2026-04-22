"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import {
  importWorkers,
  inviteTeamMember,
} from "@/lib/actions/onboarding/workers"
import { advanceStep } from "@/lib/actions/onboarding/state"
import type {
  TeamMemberRole,
  WorkerImportRow,
} from "@/lib/types/onboarding"

const ROLE_OPTIONS: { value: TeamMemberRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "compliance_manager", label: "Compliance manager" },
  { value: "field_lead", label: "Field lead" },
  { value: "auditor", label: "Auditor" },
]

type TeamInvite = { email: string; role: TeamMemberRole }

type WorkerDraft = WorkerImportRow & { localId: string }

type Props = {
  workerSingular: string
  workerPlural: string
  importHelp: string
  stepIntro: string
  initialInvites: TeamInvite[]
}

function makeLocalId(): string {
  return `w-${Math.random().toString(36).slice(2, 10)}`
}

function emptyWorker(): WorkerDraft {
  return {
    localId: makeLocalId(),
    name: "",
    role: null,
    hireDate: null,
    phone: null,
    email: null,
    siteId: null,
  }
}

type CsvParseError = { row: number; message: string }

export function PeopleForm({
  workerSingular,
  workerPlural,
  importHelp,
  stepIntro,
  initialInvites,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<"invite" | "import">("invite")

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>("compliance_manager")
  const [invites, setInvites] = useState<TeamInvite[]>(initialInvites)

  const [workers, setWorkers] = useState<WorkerDraft[]>([emptyWorker()])
  const [csvPreview, setCsvPreview] = useState<WorkerImportRow[] | null>(null)
  const [csvErrors, setCsvErrors] = useState<CsvParseError[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const updateWorker = <K extends keyof WorkerImportRow>(
    localId: string,
    field: K,
    value: WorkerImportRow[K],
  ) => {
    setWorkers((prev) =>
      prev.map((w) => (w.localId === localId ? { ...w, [field]: value } : w)),
    )
  }

  const removeWorker = (localId: string) => {
    setWorkers((prev) =>
      prev.length === 1 ? prev : prev.filter((w) => w.localId !== localId),
    )
  }

  const handleInvite = () => {
    const email = inviteEmail.trim()
    if (!email) {
      toast.error("Enter an email.")
      return
    }
    startTransition(async () => {
      const result = await inviteTeamMember({ email, role: inviteRole })
      if (!result.ok) {
        toast.error(
          result.error === "duplicate"
            ? "That teammate is already invited."
            : "Couldn't send the invite. Please try again.",
        )
        return
      }
      setInvites((prev) => [...prev, { email, role: inviteRole }])
      setInviteEmail("")
      toast.success("Invite sent.")
      router.refresh()
    })
  }

  const handleCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const response = await fetch("/api/onboarding/workers/csv", {
        method: "POST",
        body: form,
      })
      if (!response.ok) {
        const { error } = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        toast.error(error ?? "Couldn't parse that CSV.")
        return
      }
      const data = (await response.json()) as {
        preview: WorkerImportRow[]
        errors: CsvParseError[]
      }
      setCsvPreview(data.preview)
      setCsvErrors(data.errors ?? [])
      if (data.preview.length === 0) {
        toast.error("No rows parsed. Check the header row and required fields.")
      } else {
        toast.success(`${data.preview.length} rows ready to import.`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const confirmCsvImport = () => {
    if (!csvPreview || csvPreview.length === 0) return
    startTransition(async () => {
      const result = await importWorkers({ workers: csvPreview })
      if (!result.ok) {
        toast.error("Couldn't import workers. Please try again.")
        return
      }
      toast.success(`${result.data.createdCount} ${workerPlural.toLowerCase()} imported.`)
      setCsvPreview(null)
      setCsvErrors([])
      router.refresh()
    })
  }

  const saveManual = () => {
    const payload: WorkerImportRow[] = workers
      .filter((w) => w.name.trim().length > 0)
      .map((w) => ({
        name: w.name.trim(),
        role: w.role,
        hireDate: w.hireDate,
        phone: w.phone,
        email: w.email,
        siteId: null,
      }))
    if (payload.length === 0) {
      toast.error(`Add at least one ${workerSingular.toLowerCase()}.`)
      return
    }
    startTransition(async () => {
      const result = await importWorkers({ workers: payload })
      if (!result.ok) {
        toast.error("Couldn't save. Please try again.")
        return
      }
      toast.success(`${result.data.createdCount} ${workerPlural.toLowerCase()} saved.`)
      setWorkers([emptyWorker()])
      router.refresh()
    })
  }

  const continueToNext = () => {
    startTransition(async () => {
      const result = await advanceStep(4)
      if (!result.ok) {
        toast.error("Couldn't save progress.")
        return
      }
      router.push("/onboarding/subs")
    })
  }

  return (
    <StepShell
      stepNumber={4}
      totalSteps={7}
      title={`Your ${workerPlural.toLowerCase()}`}
      intro={stepIntro}
      backHref="/onboarding/sites"
    >
      <div className="flex flex-col gap-8">
        <Tabs value={tab} onValueChange={(val) => setTab(val as typeof tab)}>
          <TabsList>
            <TabsTrigger value="invite">Invite team</TabsTrigger>
            <TabsTrigger value="import">Import {workerPlural.toLowerCase()}</TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-4 border border-brand-white/[0.1] bg-midnight/40 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-email">Teammate email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(val) => setInviteRole(val as TeamMemberRole)}
                  >
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleInvite}
                    disabled={isPending || !inviteEmail.trim()}
                  >
                    Send invite
                  </Button>
                </div>
              </div>
            </div>

            {invites.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-steel">
                  Invited
                </span>
                <ul className="flex flex-col gap-2">
                  {invites.map((i) => (
                    <li
                      key={`${i.email}-${i.role}`}
                      className="flex items-center justify-between border border-brand-white/[0.1] px-3 py-2"
                    >
                      <span className="font-sans text-[14px] text-parchment">{i.email}</span>
                      <Badge variant="secondary">
                        {ROLE_OPTIONS.find((r) => r.value === i.role)?.label ?? i.role}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="import" className="mt-6 flex flex-col gap-6">
            <p className="font-sans text-[13px] text-fog">{importHelp}</p>

            <div className="flex flex-col gap-3 border border-brand-white/[0.1] bg-midnight/40 p-5">
              <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-steel">
                Upload CSV
              </span>
              <p className="font-sans text-[12px] text-steel">
                Required columns: <code>name</code>. Optional:{" "}
                <code>role</code>, <code>hire_date</code>, <code>phone</code>,{" "}
                <code>email</code>.
              </p>
              <label className="inline-flex cursor-pointer items-center gap-2 self-start border border-brand-white/[0.15] bg-void px-4 py-2 font-display text-[12px] font-semibold tracking-[1px] uppercase text-parchment hover:border-gold hover:text-gold">
                <Upload className="h-4 w-4" />
                {isUploading ? "Parsing..." : "Choose CSV file"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={handleCsv}
                  disabled={isUploading}
                />
              </label>

              {csvErrors.length > 0 ? (
                <ul className="mt-2 flex flex-col gap-1 font-sans text-[12px] text-crimson">
                  {csvErrors.slice(0, 5).map((err) => (
                    <li key={`${err.row}-${err.message}`}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              ) : null}

              {csvPreview && csvPreview.length > 0 ? (
                <div className="mt-3 flex flex-col gap-3">
                  <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-gold">
                    Preview ({csvPreview.length})
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-brand-white/[0.08]">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-void/60 text-steel">
                        <tr>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Role</th>
                          <th className="px-3 py-2">Hire date</th>
                          <th className="px-3 py-2">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className="border-t border-brand-white/[0.05]">
                            <td className="px-3 py-2 text-parchment">{row.name}</td>
                            <td className="px-3 py-2 text-fog">{row.role ?? "—"}</td>
                            <td className="px-3 py-2 text-fog">{row.hireDate ?? "—"}</td>
                            <td className="px-3 py-2 text-fog">{row.email ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button
                    type="button"
                    onClick={confirmCsvImport}
                    disabled={isPending}
                    className="self-start"
                  >
                    Confirm import
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 border border-brand-white/[0.1] bg-midnight/40 p-5">
              <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-steel">
                Add manually
              </span>
              {workers.map((w, index) => (
                <div
                  key={w.localId}
                  className="grid grid-cols-1 gap-3 border border-brand-white/[0.08] p-3 md:grid-cols-[1fr_1fr_160px_1fr_auto]"
                >
                  <Input
                    aria-label={`Name for row ${index + 1}`}
                    value={w.name}
                    onChange={(e) => updateWorker(w.localId, "name", e.target.value)}
                    placeholder="Full name"
                  />
                  <Input
                    aria-label={`Role for row ${index + 1}`}
                    value={w.role ?? ""}
                    onChange={(e) =>
                      updateWorker(w.localId, "role", e.target.value || null)
                    }
                    placeholder="Role / title"
                  />
                  <Input
                    aria-label={`Hire date for row ${index + 1}`}
                    type="date"
                    value={w.hireDate ?? ""}
                    onChange={(e) =>
                      updateWorker(w.localId, "hireDate", e.target.value || null)
                    }
                  />
                  <Input
                    aria-label={`Email for row ${index + 1}`}
                    type="email"
                    value={w.email ?? ""}
                    onChange={(e) =>
                      updateWorker(w.localId, "email", e.target.value || null)
                    }
                    placeholder="email@optional"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWorker(w.localId)}
                    aria-label={`Remove row ${index + 1}`}
                    className="text-steel hover:text-crimson"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWorkers((p) => [...p, emptyWorker()])}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add row
                </Button>
                <Button
                  type="button"
                  onClick={saveManual}
                  disabled={isPending}
                >
                  Save all
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
