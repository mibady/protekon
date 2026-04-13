-- osha_knowledge_base table
-- Referenced by lib/actions/knowledge.ts and lib/rag/indexer.ts
-- Stores compliance articles for the dashboard Knowledge Base and RAG retrieval

create table if not exists public.osha_knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text not null,
  category text not null,
  content text not null,
  cfr_standard text,
  source_publication text,
  applies_to_verticals text[] not null default '{}',
  is_california_specific boolean not null default true,
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: authenticated users can read all knowledge base articles
alter table public.osha_knowledge_base enable row level security;

create policy "Knowledge base is readable by authenticated users"
  on public.osha_knowledge_base
  for select
  to authenticated
  using (true);

-- Indexes for common query patterns
create index idx_knowledge_category on public.osha_knowledge_base (category);
create index idx_knowledge_priority on public.osha_knowledge_base (priority);
create index idx_knowledge_verticals on public.osha_knowledge_base using gin (applies_to_verticals);

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_osha_knowledge_base_updated_at
  before update on public.osha_knowledge_base
  for each row
  execute function public.set_updated_at();
