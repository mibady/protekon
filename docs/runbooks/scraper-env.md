# Runbook: OSHA Scraper DB Read Fallback

**Purpose:** Wire Protekon to the read-only `protekon_*` tables hosted in the `cli-ai-scraper` Supabase project so enforcement widgets (OSHA violations, employer risk profiles, industry benchmarks) can populate when the primary MCP path is unavailable or slow.

**Relationship:** Protekon is a read-only consumer. The scraper owns the data; Protekon only SELECTs via an anon key against tables that already carry `anon_read` RLS policies. No writes, no migrations, no scraping from inside Protekon.

---

## HANDOFF REQUIRED

The Ops Builder agent could not complete two steps autonomously in this session:

1. **Supabase MCP permission denied** — could not run `list_projects` / `get_publishable_keys` to retrieve the scraper anon key programmatically.
2. **Vercel MCP unauthenticated** — OAuth flow cannot be completed by a background agent; env vars were not set on the Preview environment.

A human operator must complete the steps below. Estimated time: 5 minutes.

### Step 1 — Retrieve the scraper anon key

Source of truth for the scraper URL: `lib/supabase/scraper.ts:8` (`https://vizmtkfpxxjzlpzibate.supabase.co`).

Option A — Supabase dashboard (fastest):
1. Open https://supabase.com/dashboard
2. Select the `cli-ai-scraper` project (URL matches `vizmtkfpxxjzlpzibate`)
3. Settings -> API -> copy the `anon` / `public` key (JWT starting with `eyJ...`) OR the newer `sb_publishable_...` key
4. Do NOT copy the `service_role` key. Protekon must only hold the anon key.

Option B — Supabase CLI:
```bash
supabase projects list                           # find project ref for vizmtkfpxxjzlpzibate
supabase projects api-keys --project-ref vizmtkfpxxjzlpzibate
```

### Step 2 — Set env vars on Protekon Vercel project (Preview only)

Do NOT promote to Production until widgets are verified on a Preview deploy.

```bash
cd ~/business/ngeniuspro/protekon

# Set on Preview environment only
vercel env add OSHA_SCRAPER_SUPABASE_URL preview
# paste: https://vizmtkfpxxjzlpzibate.supabase.co

vercel env add OSHA_SCRAPER_SUPABASE_KEY preview
# paste the anon key from Step 1

# Verify
vercel env ls preview | grep OSHA_SCRAPER
```

Then trigger a Preview deploy (`vercel --prebuilt` or push to a non-main branch) and verify before promoting:

```bash
vercel env add OSHA_SCRAPER_SUPABASE_URL production
vercel env add OSHA_SCRAPER_SUPABASE_KEY production
```

### Step 3 — Mark task complete

Once both vars are confirmed live on Preview, update Task 12 in the shared task board to `completed` with a note listing the deploy URL used for verification.

---

## What these vars unlock

`lib/osha-api.ts` attempts a direct Supabase read against three scraper-owned tables as a fallback path when MCP tool calls fail or exceed timeout:

| Table | Consumed by |
|-------|-------------|
| `protekon_osha_violations` | Enforcement feed widget, client risk panels |
| `protekon_employer_profiles` | Employer risk lookup, prospect enrichment |
| `protekon_industry_benchmarks` | Industry vertical dashboards, benchmark charts |

All three tables have `anon_read` SELECT policies applied in the scraper project. No additional cli-ai-scraper migration is required.

Without these env vars, the widgets silently return `null` and render empty states. Widgets never crash the page.

---

## Rotation procedure

If the anon key is compromised or scheduled for rotation:

1. In the scraper Supabase project: Settings -> API -> Rotate anon key (or issue a new `sb_publishable_...` key and disable the old one)
2. In the Protekon Vercel project:
   ```bash
   vercel env rm OSHA_SCRAPER_SUPABASE_KEY preview
   vercel env rm OSHA_SCRAPER_SUPABASE_KEY production
   vercel env add OSHA_SCRAPER_SUPABASE_KEY preview    # paste new key
   vercel env add OSHA_SCRAPER_SUPABASE_KEY production # paste new key
   ```
3. Redeploy Preview first, verify widgets, then promote to Production.

Because anon keys are public by design (protected by RLS), rotation is low-urgency unless RLS on a scraper-owned table is misconfigured.

---

## Runtime verification

After deploy, confirm the fallback path is reachable.

### Via Vercel runtime logs

```bash
vercel logs <deployment-url> | grep -i scraper
```

Look for:
- `[osha-api] scraper fallback hit` — fallback path executed successfully
- `[osha-api] scraper fetch failed` — env vars missing or RLS denied the query

### Via Vercel MCP (when authenticated)

```
mcp__plugin_vercel_vercel__get_runtime_logs(deploymentId: <id>, query: "scraper")
```

### Via dashboard widgets

Visit `/dashboard` on the Preview URL. Widgets that depend on scraper data:
- Enforcement feed card (should show recent violations, not empty state)
- Industry benchmark chart (should render bars, not skeleton)
- Employer risk lookup (search any employer name; should return profile if indexed)

If widgets remain empty and logs show `scraper fetch failed`, the key is wrong or RLS is blocking. Re-verify Step 1.

---

## Rollback

Safe rollback — widgets fail closed to `null`, no crashes.

```bash
vercel env rm OSHA_SCRAPER_SUPABASE_URL preview
vercel env rm OSHA_SCRAPER_SUPABASE_KEY preview
vercel env rm OSHA_SCRAPER_SUPABASE_URL production
vercel env rm OSHA_SCRAPER_SUPABASE_KEY production
```

Redeploy. Enforcement widgets will render empty states; MCP path continues to work unchanged.

---

## Related files

- `lib/supabase/scraper.ts` — Supabase client factory for the scraper project (read-only)
- `lib/osha-api.ts` — Consumers of the scraper tables (fallback logic lives here)
- `.env.example` — Documents both env var names
- `specs/protekon-remaining-work-plan.md` — Task 6 / 12 (this work)
