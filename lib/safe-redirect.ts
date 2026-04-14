/**
 * Validate a user-supplied redirect target. Returns the path only if it is
 * same-origin (starts with "/" but not "//" or "/\"). Otherwise returns the
 * fallback so an attacker cannot steer the browser to an external site via
 * `?next=`, `?redirect=`, or `?callbackUrl=` params.
 */
export function safeRedirect(target: string | null | undefined, fallback = "/dashboard"): string {
  if (!target) return fallback
  if (typeof target !== "string") return fallback

  // Must be a root-relative path.
  if (!target.startsWith("/")) return fallback

  // Reject protocol-relative (//evil.com) and back-slash tricks (/\evil.com).
  if (target.startsWith("//") || target.startsWith("/\\")) return fallback

  // Reject any embedded protocol or newline injection.
  if (/[\r\n]/.test(target)) return fallback

  return target
}
