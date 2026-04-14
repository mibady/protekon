/**
 * PII stripping per CA Labor Code §6401.9 (SB 553) requirements.
 * Used wherever we produce outputs that may be shared with employees,
 * agencies, or logged to external services.
 */
export function stripPII(text: string): string {
  if (!text) return text
  return text
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[EMAIL REDACTED]")
    .replace(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE REDACTED]")
    .replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, "[SSN REDACTED]")
    .replace(/\b(Mr|Mrs|Ms|Dr|Miss)\.?\s+[A-Z][a-z]+/g, "[NAME REDACTED]")
}
