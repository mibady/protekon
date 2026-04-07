const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  ip: string,
  { maxRequests = 5, windowMs = 60_000 }: { maxRequests?: number; windowMs?: number } = {}
): { limited: boolean } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (entry && entry.resetAt > now) {
    if (entry.count >= maxRequests) {
      return { limited: true }
    }
    entry.count++
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
  }

  return { limited: false }
}

export function getClientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}
