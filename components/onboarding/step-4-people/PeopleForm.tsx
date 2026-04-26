"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Upload } from "lucide-react"

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
import { StepShell } from "@/components/onboarding/StepShell"
import { importWorkers, inviteTeamMember } from "@/lib/actions/onboarding/workers"
import { advanceStep } from "@/lib/actions/onboarding/state"
import type { TeamMemberRole, WorkerImportRow } from "@/lib/types/onboarding"

const ROLE_OPTIONS: { value: TeamMemberRole; label: string; className: string }[] = [
  { value: "owner", label: "Owner", className: "border-gold text-gold" },
  { value: "compliance_manager", label: "Compliance Manager", className: "border-blue-400 text-blue-400" },
  { value: "field_lead", label: "Field Lead", className: "border-green-400 text-green-400" },
  { value: "auditor", label: "Auditor", className: "border-blue-400 text-blue-400" },
]

type TeamInvite = { email: string; role: TeamMemberRole }
type CsvParseError = { row: number; message: string }

type Props = {
  workerSingular: string
  workerPlural: string
  importHelp: string
  stepIntro: string
  initialInvites: TeamInvite[]
  nextHref: string
  totalSteps: number
}

const CSV_TEMPLATE =
  "name,role,hire_date,phone,email\nJane Worker,Foreman,2026-01-15,555-0100,jane@example.com\n"

function roleLabel(role: TeamMemberRole): string {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role
}

function roleClass(role: TeamMemberRole): string {
  return ROLE_OPTIONS.find((option) => option.value === role)?.className ?? "border-brand-white/[0.2] text-fog"
}

export function PeopleForm({
  workerSingular: _workerSingular,
  workerPlural,
  importHelp,
  stepIntro,
  initialInvites,
  nextHref,
  totalSteps,
}: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<"import" | "invite">("import")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>("compliance_manager")
  const [invites, setInvites] = useState<TeamInvite[]>(initialInvites)
  const [csvPreview, setCsvPreview] = useState<WorkerImportRow[] | null>(null)
  const [csvErrors, setCsvErrors] = useState<CsvParseError[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const parseCsv = async (file: File) => {
    setIsUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const response = await fetch("/api/onboarding/workers/csv", {
        method: "POST",
        body: form,
      })
      if (!response.ok) {
        const { error } = (await response.json().catch(() => ({}))) as { error?: string }
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
      setDragging(false)
    }
  }

  const handleFile = (file?: File) => {
    if (!file) return
    void parseCsv(file)
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

  const continueToNext = () => {
    startTransition(async () => {
      const result = await advanceStep(4)
      if (!result.ok) {
        toast.error("Couldn't save progress.")
        return
      }
      router.push(nextHref)
    })
  }

  return (
    <StepShell
      stepNumber={3}
      totalSteps={totalSteps}
      title={`Add your ${workerPlural.toLowerCase()}`}
      intro={stepIntro}
      backHref="/onboarding/sites"
    >
      <div className="flex flex-col gap-8">
        <Tabs value={tab} onValueChange={(val) => setTab(val as typeof tab)}>
          <TabsList className="bg-midnight/50">
            <TabsTrigger value="import">Worker CSV Import</TabsTrigger>
            <TabsTrigger value="invite">Team Invites</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-6 flex flex-col gap-6">
            <p className="font-sans text-[13px] leading-[1.6] text-fog">{importHelp}</p>

            {!csvPreview || csvPreview.length === 0 ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFile(e.dataTransfer.files[0])
                }}
                className={[
                  "flex min-h-72 w-full flex-col items-center justify-center gap-4 border border-dashed p-12 text-center transition-all",
                  dragging
                    ? "border-gold bg-gold/5"
                    : "border-brand-white/[0.2] bg-midnight/40 hover:border-gold hover:bg-gold/5",
                ].join(" ")}
              >
                <Upload className="h-12 w-12 text-gold" />
                <div>
                  <div className="font-display text-[16px] font-bold tracking-[1px] text-parchment uppercase">
                    {isUploading ? "Parsing CSV..." : "Drop your worker CSV here"}
                  </div>
                  <div className="mt-2 font-sans text-[13px] text-fog">
                    Required column: <code>name</code>. Optional: role, hire_date, phone, email.
                  </div>
                </div>
                <span className="font-sans text-[13px] text-gold">Choose file</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0])
                    e.currentTarget.value = ""
                  }}
                  disabled={isUploading}
                />
              </button>
            ) : (
              <div className="flex flex-col gap-5 border border-brand-white/[0.1] bg-midnight/40 p-5">
                <div className="font-display text-[24px] font-bold text-gold">
                  {csvPreview.length} workers ready to import!
                </div>
                <div className="max-h-72 overflow-y-auto border border-brand-white/[0.08]">
                  <table className="w-full text-left font-sans text-[12px] text-fog">
                    <thead className="sticky top-0 bg-void text-steel">
                      <tr>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Hire date</th>
                        <th className="px-3 py-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 80).map((row, idx) => (
                        <tr key={`${row.name}-${idx}`} className="border-t border-brand-white/[0.05]">
                          <td className="px-3 py-2 text-parchment">{row.name}</td>
                          <td className="px-3 py-2">{row.role ?? "-"}</td>
                          <td className="px-3 py-2">{row.hireDate ?? "-"}</td>
                          <td className="px-3 py-2">{row.email ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={confirmCsvImport} disabled={isPending}>
                    Confirm import
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setCsvPreview(null)}>
                    Choose another file
                  </Button>
                </div>
              </div>
            )}

            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
              download="protekon-worker-template.csv"
              className="self-start font-sans text-[13px] text-gold hover:underline"
            >
              Download CSV Template
            </a>

            {csvErrors.length > 0 ? (
              <ul className="flex flex-col gap-1 font-sans text-[12px] text-crimson">
                {csvErrors.slice(0, 5).map((err) => (
                  <li key={`${err.row}-${err.message}`}>
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </TabsContent>

          <TabsContent value="invite" className="mt-6 flex flex-col gap-6">
            <div className="border border-brand-white/[0.1] bg-midnight/40 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px_auto]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-email">Teammate email</Label>
                  <div className="flex items-center gap-2 border border-brand-white/[0.1] bg-void px-3">
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                    <Badge className={`shrink-0 border bg-transparent ${roleClass(inviteRole)}`}>
                      {roleLabel(inviteRole)}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(val) => setInviteRole(val as TeamMemberRole)}>
                    <SelectTrigger id="invite-role" className="bg-void">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={handleInvite} disabled={isPending || !inviteEmail.trim()}>
                    Send invite
                  </Button>
                </div>
              </div>
            </div>

            {invites.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {invites.map((invite) => (
                  <li
                    key={`${invite.email}-${invite.role}`}
                    className="flex items-center justify-between border border-brand-white/[0.1] bg-midnight/40 px-3 py-2"
                  >
                    <span className="font-sans text-[13px] text-parchment">{invite.email}</span>
                    <Badge className={`border bg-transparent ${roleClass(invite.role)}`}>
                      {roleLabel(invite.role)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="button" onClick={continueToNext} disabled={isPending} className="gap-2">
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-parchment/30 border-t-parchment" />
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </StepShell>
  )
}
