"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, FileText, Upload, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import { SkipConsequencesDialog } from "@/components/onboarding/SkipConsequencesDialog"
import {
  approveImportedDocument,
  adoptTemplate,
  markDocumentSkipped,
} from "@/lib/actions/onboarding/documents"
import { advanceStep } from "@/lib/actions/onboarding/state"

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
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [uploadCategory, setUploadCategory] = useState<string | null>(null)
  const [pendingUpload, setPendingUpload] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [skipCategory, setSkipCategory] = useState<string | null>(null)

  const covered = new Set(coveredCategories.map((c) => c.toLowerCase()))
  const skipped = new Set(skippedCategories.map((c) => c.toLowerCase()))

  const stillNeeded = [
    ...requiredCategories.map((c) => ({ category: c, required: true })),
    ...recommendedCategories.map((c) => ({ category: c, required: false })),
  ].filter(
    (item) =>
      !covered.has(item.category.toLowerCase()) &&
      !skipped.has(item.category.toLowerCase()),
  )

  const handleApprove = (doc: DocumentCard) => {
    startTransition(async () => {
      const result = await approveImportedDocument({ documentId: doc.id })
      if (!result.ok) {
        toast.error("Couldn't approve document.")
        return
      }
      toast.success("Document approved.")
      router.refresh()
    })
  }

  const handleReject = (doc: DocumentCard) => {
    startTransition(async () => {
      const result = await markDocumentSkipped({
        category: doc.type,
        reason: "rejected_during_review",
      })
      if (!result.ok) {
        toast.error("Couldn't reject document.")
        return
      }
      toast.success("Document rejected.")
      router.refresh()
    })
  }

  const handleAdopt = (category: string) => {
    startTransition(async () => {
      const result = await adoptTemplate({ category })
      if (!result.ok) {
        toast.error("Couldn't adopt template.")
        return
      }
      toast.success(`${humanizeCategory(category)} template adopted.`)
      router.refresh()
    })
  }

  const confirmSkip = (category: string) => {
    startTransition(async () => {
      const result = await markDocumentSkipped({
        category,
        reason: "user_skipped_phase_1",
      })
      if (!result.ok) {
        toast.error("Couldn't skip category.")
        return
      }
      toast.success(`${humanizeCategory(category)} skipped.`)
      setSkipCategory(null)
      router.refresh()
    })
  }

  const triggerSkip = (category: string, required: boolean) => {
    if (required) {
      setSkipCategory(category)
      return
    }
    confirmSkip(category)
  }

  const openUpload = (category: string) => {
    setUploadCategory(category)
    setPendingUpload(null)
  }

  const closeUpload = () => {
    if (isUploading) return
    setUploadCategory(null)
    setPendingUpload(null)
  }

  const submitUpload = async () => {
    if (!uploadCategory || !pendingUpload) return
    setIsUploading(true)
    try {
      const form = new FormData()
      form.append("file", pendingUpload)
      form.append("category", uploadCategory)
      const response = await fetch("/api/onboarding/documents/upload", {
        method: "POST",
        body: form,
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        toast.error(body.error ?? "Upload failed.")
        return
      }
      toast.success("File uploaded. Review it in the Needs eye column.")
      setUploadCategory(null)
      setPendingUpload(null)
      router.refresh()
    } finally {
      setIsUploading(false)
    }
  }

  const continueToNext = () => {
    startTransition(async () => {
      const result = await advanceStep(6)
      if (!result.ok) {
        toast.error("Couldn't save progress.")
        return
      }
      router.push("/onboarding/automations")
    })
  }

  return (
    <StepShell
      stepNumber={6}
      totalSteps={7}
      title="Confirm your compliance library"
      intro={stepIntro}
      backHref="/onboarding/subs"
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="flex flex-col gap-3 border border-brand-white/[0.1] bg-midnight/40 p-5">
            <header className="flex items-center justify-between">
              <h3 className="font-display text-[14px] font-bold tracking-[1px] uppercase text-parchment">
                Needs eye
              </h3>
              <Badge variant="secondary">{needsReview.length}</Badge>
            </header>
            <p className="font-sans text-[12px] text-steel">
              Imported documents awaiting your approval.
            </p>
            <ul className="flex flex-col gap-3">
              {needsReview.length === 0 ? (
                <li className="border border-dashed border-brand-white/[0.1] p-3 font-sans text-[12px] text-steel">
                  Nothing to review.
                </li>
              ) : (
                needsReview.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-col gap-3 border border-brand-white/[0.08] bg-void/40 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 text-gold" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span className="font-display text-[13px] font-semibold text-parchment">
                          {humanizeCategory(doc.type)}
                        </span>
                        {doc.filename ? (
                          <span className="font-sans text-[12px] text-steel">
                            {doc.filename}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApprove(doc)}
                        disabled={isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(doc)}
                        disabled={isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="flex flex-col gap-3 border border-brand-white/[0.1] bg-midnight/40 p-5">
            <header className="flex items-center justify-between">
              <h3 className="font-display text-[14px] font-bold tracking-[1px] uppercase text-parchment">
                Looks good
              </h3>
              <Badge variant="secondary">{approved.length}</Badge>
            </header>
            <p className="font-sans text-[12px] text-steel">Already approved.</p>
            <ul className="flex flex-col gap-3">
              {approved.length === 0 ? (
                <li className="border border-dashed border-brand-white/[0.1] p-3 font-sans text-[12px] text-steel">
                  No approved documents yet.
                </li>
              ) : (
                approved.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 border border-brand-white/[0.08] bg-void/40 p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="font-display text-[13px] font-semibold text-parchment">
                        {humanizeCategory(doc.type)}
                      </span>
                      {doc.filename ? (
                        <span className="font-sans text-[12px] text-steel">
                          {doc.filename}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="flex flex-col gap-3 border border-brand-white/[0.1] bg-midnight/40 p-5">
            <header className="flex items-center justify-between">
              <h3 className="font-display text-[14px] font-bold tracking-[1px] uppercase text-parchment">
                Still needed
              </h3>
              <Badge variant="secondary">{stillNeeded.length}</Badge>
            </header>
            <p className="font-sans text-[12px] text-steel">{templateLibraryCta}</p>
            <ul className="flex flex-col gap-3">
              {stillNeeded.length === 0 ? (
                <li className="border border-dashed border-brand-white/[0.1] p-3 font-sans text-[12px] text-steel">
                  Your library is complete.
                </li>
              ) : (
                stillNeeded.map(({ category, required }) => (
                  <li
                    key={category}
                    className="flex flex-col gap-3 border border-brand-white/[0.08] bg-void/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-[13px] font-semibold text-parchment">
                        {humanizeCategory(category)}
                      </span>
                      {required ? (
                        <Badge variant="destructive">Required</Badge>
                      ) : (
                        <Badge variant="secondary">Recommended</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAdopt(category)}
                        disabled={isPending}
                      >
                        Use template
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openUpload(category)}
                      >
                        Upload my own
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => triggerSkip(category, required)}
                        disabled={isPending}
                        className="text-steel"
                      >
                        Skip
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
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

      <Dialog open={uploadCategory !== null} onOpenChange={(open) => !open && closeUpload()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upload {uploadCategory ? humanizeCategory(uploadCategory) : "document"}
            </DialogTitle>
            <DialogDescription>
              Files up to 20 MB. We&apos;ll store it securely in your compliance library.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <label className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-brand-white/[0.2] p-6 text-center hover:border-gold">
              <Upload className="h-6 w-6 text-gold" aria-hidden="true" />
              <span className="font-display text-[13px] font-semibold text-parchment">
                {pendingUpload ? pendingUpload.name : "Click to choose a file"}
              </span>
              <span className="font-sans text-[11px] text-steel">PDF, DOCX, or image</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={(e) => setPendingUpload(e.target.files?.[0] ?? null)}
                disabled={isUploading}
              />
            </label>
            {pendingUpload ? (
              <button
                type="button"
                onClick={() => setPendingUpload(null)}
                className="inline-flex items-center gap-1 self-start font-sans text-[12px] text-steel hover:text-parchment"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            ) : null}
            {isUploading ? (
              <div className="flex items-center gap-2 font-sans text-[12px] text-gold">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                Uploading...
              </div>
            ) : null}
          </div>
          <Label id="upload-hint" className="sr-only">
            Upload a compliance document for the selected category.
          </Label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeUpload}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitUpload}
              disabled={!pendingUpload || isUploading}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SkipConsequencesDialog
        open={skipCategory !== null}
        onOpenChange={(open) => !open && setSkipCategory(null)}
        stepTitle={`${skipCategory ? humanizeCategory(skipCategory) : "Document"}`}
        consequences={[
          "Your compliance posture score will show this gap.",
          "Audits and partners may flag the missing document.",
          "You can come back and add it from Documents at any time.",
        ]}
        onConfirm={() => {
          if (skipCategory) confirmSkip(skipCategory)
        }}
      />
    </StepShell>
  )
}
