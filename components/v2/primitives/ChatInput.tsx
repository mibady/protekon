"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaperPlaneRight } from "@phosphor-icons/react"

/**
 * The sticky chat input at the bottom of Briefing (and potentially other
 * surfaces). Submitting routes to /v2/chat with the text pre-filled as
 * the first user message.
 *
 * Philosophy: chat is a universal entry point. The user can ask anything
 * from any surface. This component is the affordance for that.
 *
 * Accessibility: pressing Enter submits, Shift+Enter adds a newline.
 * Disabled state while empty; crimson send button once text is present.
 */
export function ChatInput({
  placeholder = "Ask your compliance officer anything…",
}: {
  placeholder?: string
}) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canSend = text.trim().length > 0 && !submitting

  function handleSubmit() {
    if (!canSend) return
    setSubmitting(true)
    // Pass the pre-filled message via query param; the chat page reads it
    // and starts the conversation on mount.
    const params = new URLSearchParams({ q: text.trim() })
    router.push(`/dashboard/chat?${params.toString()}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-parchment via-parchment to-transparent">
      <div
        className="bg-white border border-fog flex items-end gap-2 px-4 py-3"
        style={{ borderRadius: 0 }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm font-sans text-midnight placeholder:text-steel/70 leading-6 max-h-32"
          style={{
            minHeight: 24,
            height: "auto",
          }}
          aria-label="Ask your compliance officer"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className={`
            flex items-center justify-center shrink-0 w-9 h-9
            transition-colors
            ${
              canSend
                ? "bg-crimson text-parchment hover:bg-crimson/90"
                : "bg-fog text-steel/50 cursor-not-allowed"
            }
          `}
          style={{ borderRadius: 0 }}
          aria-label="Send message"
        >
          <PaperPlaneRight size={16} weight="fill" />
        </button>
      </div>
    </div>
  )
}
