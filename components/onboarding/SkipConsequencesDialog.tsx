"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  consequences: string[]
  stepTitle: string
}

export function SkipConsequencesDialog({
  open,
  onOpenChange,
  onConfirm,
  consequences,
  stepTitle,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Skip &quot;{stepTitle}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            You can come back to this step later from the dashboard, but
            skipping now means:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          {consequences.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel>Go back</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Skip anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
