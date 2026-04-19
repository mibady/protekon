"use client"

import { useRef, useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { UploadSimple, File as FileIcon } from "@phosphor-icons/react/dist/ssr"

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]
const ALLOWED_EXT = /\.(pdf|png|jpe?g)$/i

type Props = {
  existingFileName: string | null
  onBack: () => void
  onSubmit: (file: File) => void
}

/**
 * Step 2: W-9 upload. Accepts PDF / PNG / JPG up to 10 MB. Client-side
 * validation only; the server will re-validate on submit.
 */
export function W9UploadStep({ existingFileName, onBack, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setError(null)
    const picked = e.target.files?.[0] ?? null
    if (!picked) {
      setFile(null)
      return
    }
    if (picked.size > MAX_BYTES) {
      setError("File is larger than 10 MB. Please compress or resize it.")
      setFile(null)
      return
    }
    const typeOk =
      (picked.type && ALLOWED_TYPES.includes(picked.type)) ||
      ALLOWED_EXT.test(picked.name)
    if (!typeOk) {
      setError("Only PDF, PNG, or JPG files are accepted.")
      setFile(null)
      return
    }
    setFile(picked)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!file) {
      setError("Select your W-9 file to continue.")
      return
    }
    onSubmit(file)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div
        className="p-5 text-center"
        style={{
          background: "var(--parchment)",
          border: "1px dashed rgba(11,29,58,0.2)",
        }}
      >
        <UploadSimple size={28} color="var(--ink)" weight="regular" />
        <p
          className="font-sans mt-2"
          style={{ color: "var(--ink)", opacity: 0.7, fontSize: 14 }}
        >
          PDF, PNG, or JPG · up to 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 font-display uppercase"
          style={{
            background: "var(--void)",
            color: "var(--parchment)",
            border: "none",
            fontSize: 12,
            letterSpacing: "2px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Choose file
        </button>
      </div>

      {(file || existingFileName) && (
        <div
          className="flex items-center gap-3 p-4"
          style={{
            background: "var(--white)",
            border: "1px solid rgba(11,29,58,0.08)",
          }}
        >
          <FileIcon size={24} color="var(--steel)" weight="regular" />
          <div className="flex-1">
            <div
              className="font-display"
              style={{ color: "var(--ink)", fontSize: 14, fontWeight: 600 }}
            >
              {file?.name ?? existingFileName}
            </div>
            {file && (
              <div
                className="font-sans"
                style={{ color: "var(--ink)", opacity: 0.6, fontSize: 12 }}
              >
                {(file.size / 1024).toFixed(0)} KB
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p
          className="font-sans"
          style={{ color: "var(--enforcement)", fontSize: 14 }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <CTAButton variant="ghost" icon={false} onClick={onBack}>
          Back
        </CTAButton>
        <CTAButton variant="primary" type="submit" icon={true}>
          Continue
        </CTAButton>
      </div>
    </form>
  )
}
