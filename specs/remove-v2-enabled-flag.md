# Remove the `v2_enabled` flag

Follow-up to Session 31's full-cutover (Option 1). Once every client is on v2 and no one is using v1 anymore, the flag is dead weight — it only exists as a rollback safety net for a v2 that is no longer half-built.

## Why now

- v2 is feature-complete on main (NGE-410/411/414/412/413/481/461/474/476/460/480/479/475/477/478 v1).
- v1 is frozen — `app/dashboard/*` gets no more work.
- Cutover SQL (`UPDATE clients SET v2_enabled = true`) already ran — every client is on v2.
- The rollback path the flag was designed for (flip back en masse) is obsolete; rollback now is a Vercel promote-previous-deploy, not a DB flag flip.
- Every page under `app/v2/*` currently runs a redundant SELECT to read a column that's universally `true`.

## Callsites (7 files to touch)

Grep: `grep -rln "v2_enabled" --include="*.ts" --include="*.tsx" --include="*.sql"` on Session 31's HEAD.

| File | What to do |
|------|------------|
| `app/v2/layout.tsx` | Remove the gate that reads `v2_enabled` and redirects to `/dashboard` when false. Layout becomes a pass-through. |
| `app/v2/briefing/page.tsx` | Remove any guard that inspects `client.v2_enabled`. |
| `app/v2/coverage/[type]/page.tsx` | Same. |
| `app/v2/coverage/[type]/[id]/page.tsx` | Same. |
| `lib/v2/types.ts` | Drop `v2_enabled` from the `V2Client` type shape. |
| `__tests__/lib/v2/briefing-intelligence.test.ts` | Remove any fixture field setting `v2_enabled`. |
| `supabase/migrations/038_v2_enabled_flag.sql` | Leave as-is — migration history is immutable. Drop the column via a new migration instead (see below). |

Scaffold archive files (`protekon-v2-scaffold/*`) are intentionally stale and can be ignored — they'll be deleted whole when we clean up working-tree drift.

## New migration

`supabase/migrations/045_drop_v2_enabled_flag.sql`:

```sql
ALTER TABLE clients DROP COLUMN IF EXISTS v2_enabled;
```

No backfill needed — column is just being removed, no data migration. RLS policies don't reference `v2_enabled` (verified in Session 29 — the gate lives entirely in the Next.js layout, not in Postgres policies).

## Kill the v1 dashboard too? (open question)

Leaving `app/dashboard/*` in place after the flag is gone means every legacy vertical page still builds, still takes up bundle space, still gets indexed by Sanity's sitemap route. If v1 really is frozen, the follow-up-to-the-follow-up is deleting:

- `app/dashboard/**` (32 pages per the Session 0 audit)
- Any `/dashboard` route references in marketing copy / auth redirect paths
- The sitemap entries

Deferred to a later ticket — **do not bundle with the flag removal.** Keep this PR a one-file surgical change.

## Test plan

- [ ] tsc clean on all 7 touched files
- [ ] Local `npm run dev`, sign in as any client, confirm `/v2/briefing` still loads (no redirect loop)
- [ ] Run migration 045 against local Supabase, confirm column drop succeeds
- [ ] Confirm `__tests__/lib/v2/briefing-intelligence.test.ts` still passes after fixture cleanup
- [ ] Vercel preview deploy: spot-check the four `/v2/*` routes still render

## Rollback strategy

If this PR needs to revert after merge, the migration is the blocker — `ALTER TABLE clients ADD COLUMN v2_enabled boolean NOT NULL DEFAULT true` in a new migration `046_restore_v2_enabled_flag.sql`. The code revert is a single `git revert <merge-commit>`. Rollback is safe even if clients have been hitting production against the no-flag code, because every client would default to `true` under the restored column.

## Ticket

File as `NGE-XXX — Remove v2_enabled flag` after cutover smoke passes. Parent: NGE-413 (coverage drilldown) or similar v2 epic.
