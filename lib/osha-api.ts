import type {
  OshaIndustryProfile,
  OshaNearbyEnforcement,
  OshaBenchmarks,
} from "@/lib/types"

const OSHA_API_URL = process.env.OSHA_API_URL
const OSHA_API_KEY = process.env.OSHA_API_KEY

// Simple in-memory cache with 1-hour TTL
const cache = new Map<string, { data: unknown; expiry: number }>()
const TTL_MS = 60 * 60 * 1000 // 1 hour

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return undefined
  }
  return entry.data as T
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + TTL_MS })
}

async function oshaFetch<T>(path: string): Promise<T | null> {
  if (!OSHA_API_URL || !OSHA_API_KEY) {
    console.warn("[osha-api] OSHA_API_URL or OSHA_API_KEY not configured")
    return null
  }

  try {
    const res = await fetch(`${OSHA_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${OSHA_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.warn(`[osha-api] ${path} returned ${res.status}`)
      return null
    }

    return (await res.json()) as T
  } catch (err) {
    console.warn(
      "[osha-api] Fetch failed:",
      path,
      err instanceof Error ? err.message : err
    )
    return null
  }
}

export async function getIndustryProfile(
  naicsCode: string
): Promise<OshaIndustryProfile | null> {
  const cacheKey = `industry:${naicsCode}`
  const cached = getCached<OshaIndustryProfile>(cacheKey)
  if (cached) return cached

  const data = await oshaFetch<OshaIndustryProfile>(
    `/industry/${encodeURIComponent(naicsCode)}`
  )
  if (data) setCache(cacheKey, data)
  return data
}

export async function getNearbyEnforcement(
  city: string,
  state: string = "CA",
  limit: number = 20
): Promise<OshaNearbyEnforcement[]> {
  const cacheKey = `enforcement:${city}:${state}:${limit}`
  const cached = getCached<OshaNearbyEnforcement[]>(cacheKey)
  if (cached) return cached

  const data = await oshaFetch<OshaNearbyEnforcement[]>(
    `/enforcement/nearby?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&limit=${limit}`
  )
  const result = data ?? []
  if (result.length > 0) setCache(cacheKey, result)
  return result
}

export async function getBenchmarks(
  vertical: string
): Promise<OshaBenchmarks | null> {
  const cacheKey = `benchmarks:${vertical}`
  const cached = getCached<OshaBenchmarks>(cacheKey)
  if (cached) return cached

  const data = await oshaFetch<OshaBenchmarks>(
    `/benchmarks/${encodeURIComponent(vertical)}`
  )
  if (data) setCache(cacheKey, data)
  return data
}
