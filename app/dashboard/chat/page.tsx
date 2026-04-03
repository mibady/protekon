"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState } from "react"
import { motion } from "framer-motion"
import { PaperPlaneRight, Robot, User, ArrowDown } from "@phosphor-icons/react"

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [input, setInput] = useState("")

  const isLoading = status === "streaming"

  function scrollToBottom() {
    const container = document.getElementById("chat-messages")
    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100)
  }

  const suggestions = [
    "What is my current compliance posture?",
    "What has my compliance officer flagged this week?",
    "What would an inspector look for at my business?",
    "What regulatory changes affect my industry right now?",
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-midnight/[0.08]">
        <h1 className="font-display font-black text-[24px] text-midnight">
          Compliance Assistant
        </h1>
        <p className="font-sans text-[13px] text-steel">
          Ask questions about your compliance obligations, regulations, and documents.
        </p>
      </div>

      {/* Messages */}
      <div
        id="chat-messages"
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-crimson/10 mb-6">
              <Robot size={32} weight="fill" className="text-crimson" />
            </div>
            <h2 className="font-display font-bold text-[20px] text-midnight mb-2">
              PROTEKON AI Compliance Officer
            </h2>
            <p className="font-sans text-[14px] text-steel max-w-md mb-8">
              I have access to your compliance profile, documents, incidents, and the latest
              regulatory updates. Ask me anything about California workplace compliance.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    sendMessage({ text: suggestion })
                  }}
                  className="text-left bg-brand-white border border-midnight/[0.08] p-3 font-sans text-[13px] text-steel hover:border-crimson/30 hover:text-midnight transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-crimson/10">
                <Robot size={16} weight="fill" className="text-crimson" />
              </div>
            )}

            <div
              className={`max-w-[80%] px-4 py-3 ${
                message.role === "user"
                  ? "bg-midnight text-parchment"
                  : "bg-brand-white border border-midnight/[0.08]"
              }`}
            >
              <div className={`font-sans text-[14px] leading-relaxed whitespace-pre-wrap ${
                message.role === "user" ? "text-parchment" : "text-midnight"
              }`}>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <span key={i}>{part.text}</span>
                  }
                  return null
                })}
              </div>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-midnight/10">
                <User size={16} weight="fill" className="text-midnight" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-crimson/10">
              <Robot size={16} weight="fill" className="text-crimson" />
            </div>
            <div className="bg-brand-white border border-midnight/[0.08] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-crimson/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-crimson/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-crimson/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 w-8 h-8 bg-midnight text-parchment flex items-center justify-center shadow-lg hover:bg-midnight/80 transition-colors"
        >
          <ArrowDown size={16} weight="bold" />
        </button>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-midnight/[0.08] bg-brand-white">
        <form
          id="chat-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim()) {
              sendMessage({ text: input })
              setInput("")
            }
          }}
          className="flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your compliance obligations..."
            disabled={isLoading}
            className="flex-1 bg-parchment border border-midnight/[0.08] px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel/50 focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-60"
          />
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-crimson text-parchment w-11 h-11 flex items-center justify-center hover:bg-crimson/90 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PaperPlaneRight size={18} weight="fill" />
          </motion.button>
        </form>
        <p className="font-sans text-[10px] text-steel/40 mt-2 text-center">
          Not legal advice. Consult a compliance specialist for legal questions.
        </p>
      </div>
    </div>
  )
}
