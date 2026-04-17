import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the Supabase server client at import time so getIntelligence receives
// our synthetic query builder. Tests mutate `seedRows` per scenario.
let seedRows: Record<string, unknown>[] = []
let lastFilters: {
  contains?: { col: string; val: unknown[] }
  gte?: { col: string; val: string }
  not?: { col: string; op: string; val: string }
  orders: Array<{ col: string; ascending: boolean }>
  limit?: number
  select?: string
} = { orders: [] }

function makeQueryBuilder(rows: Record<string, unknown>[]) {
  const state = { rows }
  const builder: Record<string, unknown> = {}
  builder.select = vi.fn((cols: string) => {
    lastFilters.select = cols
    return builder
  })
  builder.contains = vi.fn((col: string, val: unknown[]) => {
    lastFilters.contains = { col, val }
    state.rows = state.rows.filter((r) => {
      const tags = r[col]
      if (!Array.isArray(tags)) return false
      return (val as unknown[]).every((v) => tags.includes(v))
    })
    return builder
  })
  builder.gte = vi.fn((col: string, val: string) => {
    lastFilters.gte = { col, val }
    state.rows = state.rows.filter((r) => String(r[col]) >= val)
    return builder
  })
  builder.not = vi.fn((col: string, op: string, val: string) => {
    lastFilters.not = { col, op, val }
    // Parse `{uuid}` form for cs check.
    const inner = val.replace(/^\{|\}$/g, "")
    state.rows = state.rows.filter((r) => {
      const arr = r[col]
      if (!Array.isArray(arr)) return true
      return !arr.includes(inner)
    })
    return builder
  })
  builder.order = vi.fn((col: string, opts: { ascending: boolean }) => {
    lastFilters.orders.push({ col, ascending: opts.ascending })
    state.rows = [...state.rows].sort((a, b) => {
      const av = a[col]
      const bv = b[col]
      if (typeof av === "number" && typeof bv === "number") {
        return opts.ascending ? av - bv : bv - av
      }
      const as = String(av ?? "")
      const bs = String(bv ?? "")
      return opts.ascending ? as.localeCompare(bs) : bs.localeCompare(as)
    })
    return builder
  })
  builder.limit = vi.fn(async (n: number) => {
    lastFilters.limit = n
    return { data: state.rows.slice(0, n), error: null }
  })
  return builder
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => makeQueryBuilder(seedRows)),
  })),
}))

import { getIntelligence } from "@/lib/v2/actions/briefing"

function daysAgoIso(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

function baseClient() {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    business_name: "Acme Framing",
    vertical: "construction",
    state: "CA",
    compliance_score: 80,
    v2_enabled: true,
    onboarding_completed_at: new Date().toISOString(),
  }
}

function buildRow(overrides: Partial<Record<string, unknown>>) {
  return {
    id: `row-${Math.random().toString(36).slice(2, 8)}`,
    headline: "Story",
    story: "Body",
    means_for_you: "So what",
    link_url: "https://example.com",
    source_name: "Cal/OSHA",
    severity: "context",
    created_at: daysAgoIso(1),
    relevance_score: 60,
    vertical_tags: ["construction"],
    geo_tags: [],
    dismissed_by_client_ids: [],
    ...overrides,
  }
}

beforeEach(() => {
  seedRows = []
  lastFilters = { orders: [] }
})

describe("getIntelligence / vertical filtering", () => {
  it("returns only rows whose vertical_tags contain client.vertical", async () => {
    seedRows = [
      buildRow({
        id: "a",
        vertical_tags: ["construction"],
        relevance_score: 80,
      }),
      buildRow({ id: "b", vertical_tags: ["healthcare"], relevance_score: 90 }),
      buildRow({
        id: "c",
        vertical_tags: ["construction", "wholesale"],
        relevance_score: 70,
      }),
    ]
    const out = await getIntelligence(baseClient())
    const ids = out.map((s) => s.id).sort()
    expect(ids).toEqual(["a", "c"])
  })
})

describe("getIntelligence / result cap", () => {
  it("caps at 5 results", async () => {
    seedRows = Array.from({ length: 12 }, (_, i) =>
      buildRow({
        id: `r${i}`,
        relevance_score: 100 - i,
        vertical_tags: ["construction"],
      })
    )
    const out = await getIntelligence(baseClient())
    expect(out).toHaveLength(5)
  })
})

describe("getIntelligence / recency half-life", () => {
  it("prefers recent over older at equal relevance", async () => {
    seedRows = [
      buildRow({
        id: "fresh",
        relevance_score: 60,
        created_at: daysAgoIso(1),
        vertical_tags: ["construction"],
      }),
      buildRow({
        id: "stale",
        relevance_score: 60,
        created_at: daysAgoIso(10),
        vertical_tags: ["construction"],
      }),
    ]
    const out = await getIntelligence(baseClient())
    expect(out[0].id).toBe("fresh")
  })
})

describe("getIntelligence / dismissal exclusion", () => {
  it("excludes rows where the client id is in dismissed_by_client_ids", async () => {
    const client = baseClient()
    seedRows = [
      buildRow({
        id: "kept",
        relevance_score: 50,
        vertical_tags: ["construction"],
        dismissed_by_client_ids: [],
      }),
      buildRow({
        id: "dismissed",
        relevance_score: 99,
        vertical_tags: ["construction"],
        dismissed_by_client_ids: [client.id],
      }),
    ]
    const out = await getIntelligence(client)
    expect(out.map((r) => r.id)).toEqual(["kept"])
  })
})

describe("getIntelligence / geo boost", () => {
  it("boosts rows whose geo_tags include client.state.toLowerCase()", async () => {
    // Same relevance, same age → in-state row wins by 1.25× boost.
    seedRows = [
      buildRow({
        id: "ca-match",
        relevance_score: 60,
        created_at: daysAgoIso(2),
        vertical_tags: ["construction"],
        geo_tags: ["ca"],
      }),
      buildRow({
        id: "tx-only",
        relevance_score: 60,
        created_at: daysAgoIso(2),
        vertical_tags: ["construction"],
        geo_tags: ["tx"],
      }),
    ]
    const out = await getIntelligence(baseClient())
    expect(out[0].id).toBe("ca-match")
  })
})

describe("getIntelligence / IntelligenceStory shape", () => {
  it("projects DB row → IntelligenceStory with defaults", async () => {
    seedRows = [
      buildRow({
        id: "r1",
        headline: "Warehouse fined $38K",
        story: "Narrative.",
        means_for_you: null,
        link_url: null,
        severity: null,
        vertical_tags: ["construction"],
      }),
    ]
    const out = await getIntelligence(baseClient())
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({
      id: "r1",
      headline: "Warehouse fined $38K",
      story: "Narrative.",
      means_for_you: "",
      link_url: "#",
      severity: "context",
    })
    // published_at mirrors created_at.
    expect(typeof out[0].published_at).toBe("string")
  })
})

describe("getIntelligence / 7-row cross-vertical mix", () => {
  it("returns only the 3 construction rows for a construction client, ≤5", async () => {
    seedRows = [
      buildRow({ id: "c1", vertical_tags: ["construction"], relevance_score: 80 }),
      buildRow({ id: "c2", vertical_tags: ["construction"], relevance_score: 70 }),
      buildRow({ id: "c3", vertical_tags: ["construction"], relevance_score: 60 }),
      buildRow({ id: "h1", vertical_tags: ["healthcare"], relevance_score: 95 }),
      buildRow({ id: "h2", vertical_tags: ["healthcare"], relevance_score: 85 }),
      buildRow({ id: "m1", vertical_tags: ["manufacturing"], relevance_score: 75 }),
      buildRow({ id: "m2", vertical_tags: ["manufacturing"], relevance_score: 65 }),
    ]
    const out = await getIntelligence(baseClient())
    const ids = out.map((r) => r.id).sort()
    expect(ids).toEqual(["c1", "c2", "c3"])
  })
})
