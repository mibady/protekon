"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, FileText, Rocket, ShieldCheck, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StepShell } from "@/components/onboarding/StepShell"
import {
  adoptTemplate,
  approveImportedDocument,
  finalizeOnboarding,
  markDocumentSkipped,
} from "@/lib/actions/onboarding/documents"

export type DocumentCard = {
  id: string
  document_id: string | null
  type: string
  filename: string | null
  status: string
}

type Props = {
  needsReview: DocumentCard[]
  approved: DocumentCard[]
  requiredCategories: string[]
  recommendedCategories: string[]
  coveredCategories: string[]
  skippedCategories: string[]
  stepIntro: string
  templateLibraryCta: string
  backHref: string
  stepNumber: number
  totalSteps: number
}

function humanizeCategory(category: string): string {
  return category
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function DocumentsBoard({
  needsReview,
  approved,
  requiredCategories,
  recommendedCategories,
  coveredCategories,
  skippedCategories,
  stepIntro,
  templateLibraryCta,
  backHref,
  stepNumber,
  totalSteps,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [reviewQueue, setReviewQueue] = useState(needsReview)
  const [swipeTone, setSwipeTone] = useState<"approve" | "reject" | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated, setGenerated] = useState<Set<string>>(new Set())
  const [launching, setLaunching] = useState(false)

  const covered = useMemo(
    () => new Set([...coveredCategories, ...Array.from(generated)].map((c) => c.toLowerCase())),
    [coveredCategories, generated],
  )
  const skipped = useMemo(
    () => new Set(skippedCategories.map((c) => c.toLowerCase())),
    [skippedCategories],
  )

  const stillNeeded = [
    ...requiredCategories.map((c) => ({ category: c, required: true })),
    ...recommendedCategories.map((c) => ({ category: c, required: false })),
  ].filter(
    (item) =>
      !covered.has(item.category.toLowerCase()) &&
      !skipped.has(item.category.toLowerCase()),
  )

  const activeDoc = reviewQueue[0]

  const dismissCard = (tone: "approve" | "reject") => {
    setSwipeTone(tone)
    window.setTimeout(() => {
      setReviewQueue((prev) => prev.slice(1))
      setSwipeTone(null)
    }, 220)
  }

  const handleApprove = (doc: DocumentCard) => {
    dismissCard("approve")
    startTransition(async () => {
      const result = await approveImportedDocument({ documentId: doc.id })
      if (!result.ok) {
        toast.error("Couldn't approve document.")
        router.refresh()
        return
      }
      toast.success("Document approved.")
      router.refresh()
    })
  }

  const handleReject = (doc: DocumentCard) => {
    dismissCard("reject")
    startTransition(async () => {
      const result = await markDocumentSkipped({
        category: doc.type,
        reason: "rejected_during_review",
      })
      if (!result.ok) {
        toast.error("Couldn't reject document.")
        router.refresh()
        return
      }
      toast.success("Document rejected.")
      router.refresh()
    })
  }

  const handleGenerate = (category: string) => {
    setGenerating(category)
    window.setTimeout(() => {
      startTransition(async () => {
        const result = await adoptTemplate({ category })
        setGenerating(null)
        if (!result.ok) {
          toast.error("Couldn't generate that document.")
          return
        }
        setGenerated((prev) => new Set([...prev, category]))
        toast.success(`${humanizeCategory(category)} generated.`)
        router.refresh()
      })
    }, 1500)
  }

  const launchDashboard = () => {
    setLaunching(true)
    startTransition(async () => {
      const result = await finalizeOnboarding()
      if (!result.ok) {
        setLaunching(false)
        toast.error("Couldn't launch dashboard. Please try again.")
        return
      }
      router.push(result.data.href)
    })
  }

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Finalize your compliance library"
      intro={stepIntro}
      backHref={backHref}
    >
      <div className="flex flex-col gap-8">
        <section className="border border-brand-white/[0.1] bg-midnight/40 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[14px] font-bold tracking-[1px] text-parchment uppercase">
                Needs Eye
              </h3>
              <p className="mt-1 font-sans text-[12px] text-steel">
                Review one document at a time.
              </p>
            </div>
            <Badge variant="secondary">{reviewQueue.length}</Badge>
          </div>

          {activeDoc ? (
            <div
              className={[
                "flex min-h-72 flex-col justify-between border border-brand-white/[0.1] bg-void/50 p-6 transition-all duration-200",
                swipeTone === "approve" ? "translate-x-8 opacity-0" : "",
                swipeTone === "reject" ? "-translate-x-8 opacity-0" : "",
              ].join(" ")}
            >
              <div className="flex flex-col gap-4">
                <FileText className="h-8 w-8 text-gold" />
                <div>
                  <div className="font-display text-[24px] font-bold leading-tight text-parchment">
                    {humanizeCategory(activeDoc.type)}
                  </div>
                  {activeDoc.filename ? (
                    <div className="mt-2 font-sans text-[13px] text-fog">{activeDoc.filename}</div>
                  ) : null}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={() => handleApprove(activeDoc)}
                  disabled={isPending}
                  className="h-16 gap-2 bg-gold/20 font-display text-[13px] tracking-[1px] text-gold hover:bg-gold/30"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Approve
                </Button>
                <Button
                  type="button"
                  onClick={() => handleReject(activeDoc)}
                  disabled={isPending}
                  className="h-16 gap-2 bg-crimson/10 font-display text-[13px] tracking-[1px] text-crimson hover:bg-crimson/20"
                >
                  <XCircle className="h-5 w-5" />
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-brand-white/[0.1] p-8 text-center font-sans text-[13px] text-steel">
              Nothing needs review.
            </div>
          )}
        </section>

        <section className="border border-brand-white/[0.1] bg-midnight/40 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[14px] font-bold tracking-[1px] text-parchment uppercase">
                Still Needed
              </h3>
              <p className="mt-1 font-sans text-[12px] text-steel">{templateLibraryCta}</p>
            </div>
            <Badge variant="secondary">{stillNeeded.length}</Badge>
          </div>

          <ul className="flex flex-col gap-3">
            {stillNeeded.length === 0 ? (
              <li className="border border-dashed border-brand-white/[0.1] p-4 font-sans text-[13px] text-steel">
                Your library is complete.
              </li>
            ) : (
              stillNeeded.map(({ category, required }) => {
                const isGenerating = generating === category
                return (
                  <li
                    key={category}
                    className="flex flex-col gap-3 border border-brand-white/[0.08] bg-void/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-display text-[13px] font-semibold text-parchment">
                        {humanizeCategory(category)}
                      </div>
                      <div className="mt-1">
                        <Badge variant={required ? "destructive" : "secondary"}>
                          {required ? "Required" : "Recommended"}
                        </Badge>
                      </div>
                    </div>
                    {isGenerating ? (
                      <div className="h-9 w-40 animate-pulse bg-midnight" />
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleGenerate(category)}
                        disabled={isPending}
                        className="gap-2 border border-gold bg-midnight text-gold hover:bg-gold/10"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Generate for me
                      </Button>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </section>

        {approved.length > 0 ? (
          <section className="border border-brand-white/[0.08] bg-midnight/40 p-5">
            <div className="mb-3 font-display text-[12px] tracking-[2px] text-steel uppercase">
              Approved
            </div>
            <div className="flex flex-wrap gap-2">
              {approved.slice(0, 12).map((doc) => (
                <Badge key={doc.id} className="border border-gold/20 bg-gold/10 text-gold">
                  {humanizeCategory(doc.type)}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        <Button
          type="button"
          onClick={launchDashboard}
          disabled={launching || isPending}
          className="group h-auto w-full bg-gold py-6 font-display text-[16px] font-bold tracking-[2px] text-void uppercase transition-all hover:brightness-110"
        >
          {launching ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-void/30 border-t-void" />
          ) : (
            <Rocket className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          )}
          Activate Compliance Autopilot & Launch Dashboard
        </Button>
      </div>
    </StepShell>
  )
}
