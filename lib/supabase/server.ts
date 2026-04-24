/**
 * STUB — Supabase server client.
 *
 * A Proxy-based chainable query builder exposed through an explicit
 * `StubQuery<T>` interface so callers can use generic methods like
 * `.returns<T>()`, `.single<T>()`, and `.select<T>()` without TypeScript
 * errors. Every await resolves to `{ data: [], error: null }`.
 *
 * Swap this file for the real `@supabase/ssr` client when wiring a
 * backend. The public signature — `createClient()` returning an object
 * with `.auth.getUser()` and `.from(table)` — matches Supabase's API
 * shape, so nothing in the page code needs to change.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type StubResult<T> = { data: T; error: null }

interface StubQuery<T = any> extends Promise<StubResult<T>> {
  select<U = T>(cols?: string): StubQuery<U>
  eq(col: string, val: unknown): StubQuery<T>
  neq(col: string, val: unknown): StubQuery<T>
  in(col: string, vals: unknown[]): StubQuery<T>
  is(col: string, val: unknown): StubQuery<T>
  gt(col: string, val: unknown): StubQuery<T>
  gte(col: string, val: unknown): StubQuery<T>
  lt(col: string, val: unknown): StubQuery<T>
  lte(col: string, val: unknown): StubQuery<T>
  like(col: string, pat: string): StubQuery<T>
  ilike(col: string, pat: string): StubQuery<T>
  match(crit: Record<string, unknown>): StubQuery<T>
  filter(col: string, op: string, val: unknown): StubQuery<T>
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): StubQuery<T>
  limit(n: number): StubQuery<T>
  range(from: number, to: number): StubQuery<T>
  returns<U = T>(): StubQuery<U>
  single<U = T>(): Promise<StubResult<U | null>>
  maybeSingle<U = T>(): Promise<StubResult<U | null>>
}

function makeQuery<T = any>(): StubQuery<T> {
  const resolved: StubResult<T> = { data: [] as unknown as T, error: null }
  const target: any = {
    then: (cb: (v: StubResult<T>) => any) =>
      Promise.resolve(resolved).then(cb),
    catch: (cb: any) => Promise.resolve(resolved).catch(cb),
    finally: (cb: any) => Promise.resolve(resolved).finally(cb),
  }
  const proxy: StubQuery<T> = new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop as keyof typeof t]
      if (prop === "single" || prop === "maybeSingle") {
        return () => Promise.resolve({ data: null, error: null })
      }
      // Any chained method returns the same proxy so callers keep chaining.
      return (..._args: any[]) => proxy
    },
  }) as unknown as StubQuery<T>
  return proxy
}

export async function createClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: "stub-user-id", email: "demo@example.com" } },
        error: null,
      }),
    },
    from(_table: string) {
      return {
        select: <T = any>(_cols?: string) => makeQuery<T[]>(),
        insert: (..._args: any[]) =>
          Promise.resolve({ data: null, error: null }),
        update: (..._args: any[]) => makeQuery(),
        upsert: (..._args: any[]) =>
          Promise.resolve({ data: null, error: null }),
        delete: (..._args: any[]) => makeQuery(),
      }
    },
  }
}
