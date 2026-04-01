# Server Actions: Documents + Incidents — Implementation Spec

## Overview

Stage 3 of the backend-first workflow: create server actions for document requests and incident logging, plus data-fetching queries to replace static placeholder data on list pages. After this stage, users can submit real document requests, log real incidents, and see their own data from Supabase.

## Layers

- [x] Database: Schema additions (metadata jsonb on incidents, status on documents)
- [x] Backend: Server actions + data queries
- [x] Frontend: Wire 4 dashboard pages to real actions/data
- [ ] AI: Not applicable

## Schema Additions

The existing tables need minor additions to support the full form data:

### incidents — add `metadata` jsonb
The form collects fields not in the current schema (type, time, injuryOccurred, medicalTreatment, witnesses, actionsTaken). Store in a `metadata` jsonb column rather than adding 6 narrow columns.

```sql
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
```

### documents — add `status` and `notes`
Document requests need a status lifecycle (requested → generating → current) and freeform notes. The `storage_url` and `pages` remain null until generation completes (future Inngest stage).

```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status text DEFAULT 'current';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS priority text DEFAULT 'standard';
```

## Contract

### Server Actions

```ts
// lib/actions/documents.ts
export async function requestDocument(formData: FormData): Promise<ActionResult>
export async function getDocuments(): Promise<Document[]>

// lib/actions/incidents.ts
export async function createIncident(formData: FormData): Promise<ActionResult>
export async function getIncidents(): Promise<Incident[]>
```

### Types

```ts
// lib/types.ts
export type ActionResult = { error?: string; success?: boolean }

export type Document = {
  id: string
  document_id: string
  type: string
  filename: string
  storage_url: string | null
  pages: number | null
  status: string
  notes: string | null
  priority: string
  created_at: string
}

export type Incident = {
  id: string
  incident_id: string
  description: string
  location: string | null
  incident_date: string | null
  severity: string
  follow_up_id: string | null
  metadata: {
    type?: string
    time?: string
    injuryOccurred?: boolean
    medicalTreatment?: boolean
    witnesses?: string
    actionsTaken?: string
  }
  created_at: string
}
```

## Files to Create

| # | File | Purpose |
|---|------|---------|
| 1 | `lib/types.ts` | Shared types (ActionResult, Document, Incident) |
| 2 | `lib/actions/documents.ts` | requestDocument, getDocuments |
| 3 | `lib/actions/incidents.ts` | createIncident, getIncidents |

## Files to Modify

| # | File | Change |
|---|------|--------|
| 4 | `app/dashboard/documents/page.tsx` | Replace static data with `getDocuments()` |
| 5 | `app/dashboard/documents/request/page.tsx` | Wire form to `requestDocument` action |
| 6 | `app/dashboard/incidents/page.tsx` | Replace static data with `getIncidents()` |
| 7 | `app/dashboard/incidents/new/page.tsx` | Wire form to `createIncident` action |
| 8 | `lib/actions/auth.ts` | Extract shared ActionResult type to lib/types.ts |

## Implementation Order

### Phase 1: Schema Migration

1. Add `metadata` jsonb column to `incidents` table
2. Add `status`, `notes`, `priority` columns to `documents` table
3. Add INSERT policy for `documents` table (currently only has SELECT)

### Phase 2: Shared Types

4. Create `lib/types.ts` with ActionResult, Document, Incident types
5. Update `lib/actions/auth.ts` to import ActionResult from shared types

### Phase 3: Server Actions

6. Create `lib/actions/documents.ts`:
   - `requestDocument(formData)`: Get authenticated user, generate document_id (DOC-YYYY-NNN), insert into documents with status "requested", log to audit_log
   - `getDocuments()`: Get authenticated user, select from documents where client_id = user.id, order by created_at desc

7. Create `lib/actions/incidents.ts`:
   - `createIncident(formData)`: Get authenticated user, generate incident_id (INC-YYYY-NNN), extract form fields, insert into incidents with metadata jsonb, log to audit_log
   - `getIncidents()`: Get authenticated user, select from incidents where client_id = user.id, order by incident_date desc

### Phase 4: Wire Form Pages

8. **documents/request/page.tsx**: Replace simulated submit with `requestDocument` server action. Add `name` attributes to form fields. Show error state on failure.

9. **incidents/new/page.tsx**: Replace simulated submit with `createIncident` server action. Add `name` attributes to form fields. Show error state on failure.

### Phase 5: Wire List Pages

10. **documents/page.tsx**: Convert to Server Component (remove "use client" from data-fetching layer). Call `getDocuments()` and pass data as props to a client component for filtering/interaction.

11. **incidents/page.tsx**: Same pattern — Server Component fetches data, passes to client component for the slide-over panel interaction.

## Acceptance Criteria

- [ ] `npm run build` passes
- [ ] Document request form submits to Supabase → row appears in `documents` table
- [ ] Incident form submits to Supabase → row appears in `incidents` table with metadata
- [ ] Documents list page shows real data from Supabase (not static)
- [ ] Incidents list page shows real data from Supabase (not static)
- [ ] Both actions log to `audit_log` table
- [ ] RLS enforced — users only see their own documents/incidents
- [ ] Error states display on form submission failure
- [ ] No simulated delays remain on document request or incident forms
