"use client"

import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

/**
 * Uppercase tracked call-to-action button with optional trailing arrow.
 *
 * Matches the Remix `atoms.jsx` CTAButton:
 *   - primary   → enforcement red bg, parchment text
 *   - secondary → void dark bg, parchment text
 *   - ghost     → transparent bg, ink text, hairline ink@15% border
 *
 * Example:
 *   <CTAButton onClick={submit}>Report now</CTAButton>
 *   <CTAButton variant="ghost" icon={false}>Cancel</CTAButton>
 */
type CTAVariant = "primary" | "secondary" | "ghost"

type CTAButtonProps = {
  children: React.ReactNode
  variant?: CTAVariant
  onClick?: () => void
  icon?: boolean
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
}

const VARIANT_STYLE: Record<CTAVariant, React.CSSProperties> = {
  primary: {
    background: "var(--enforcement)",
    color: "var(--parchment)",
    border: "none",
  },
  secondary: {
    background: "var(--void)",
    color: "var(--parchment)",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "var(--ink)",
    border: "1px solid rgba(10, 19, 35, 0.15)",
  },
}

export function CTAButton({
  children,
  variant = "primary",
  onClick,
  icon = true,
  className = "",
  type = "button",
  disabled = false,
}: CTAButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 font-display uppercase transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
      style={{
        ...VARIANT_STYLE[variant],
        fontSize: "12px",
        letterSpacing: "2px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
      {icon && <ArrowRight size={12} weight="bold" />}
    </button>
  )
}
