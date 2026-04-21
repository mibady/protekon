"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SkipConsequencesDialog } from "./SkipConsequencesDialog"

type Props = {
  stepNumber: number
  totalSteps: number
  title: string
  intro: string
  backHref?: string
  skipConsequences?: string[]
  onSkip?: () => void | Promise<void>
  children: ReactNode
}

export function StepShell({
  stepNumber,
  totalSteps,
  title,
  intro,
  backHref,
  skipConsequences,
  onSkip,
  children,
}: Props) {
  const [skipOpen, setSkipOpen] = useState(false)

  const canSkip = Boolean(skipConsequences && skipConsequences.length > 0 && onSkip)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="font-display text-[11px] font-semibold tracking-[3px] uppercase text-steel">
          Step {stepNumber} of {totalSteps}
        </span>
        <h1 className="font-display text-[32px] font-black leading-tight text-parchment">
          {title}
        </h1>
        <p className="max-w-prose font-sans text-[15px] leading-[1.65] text-fog">{intro}</p>
      </header>

      <div>{children}</div>

      <footer className="flex items-center justify-between border-t border-brand-white/[0.08] pt-6">
        {backHref ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={backHref} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          {canSkip ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setSkipOpen(true)}>
              Skip for now
            </Button>
          ) : null}
        </div>
      </footer>

      {canSkip && skipConsequences && onSkip ? (
        <SkipConsequencesDialog
          open={skipOpen}
          onOpenChange={setSkipOpen}
          stepTitle={title}
          consequences={skipConsequences}
          onConfirm={async () => {
            setSkipOpen(false)
            await onSkip()
          }}
        />
      ) : null}
    </div>
  )
}

export function StepFooterNext({
  disabled,
  loading,
  label = "Continue",
}: {
  disabled?: boolean
  loading?: boolean
  label?: string
}) {
  return (
    <Button type="submit" disabled={disabled || loading} className="gap-2">
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-parchment/30 border-t-parchment" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  )
}
