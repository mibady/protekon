-- osha_knowledge_base: unique title for idempotent seeding
-- Referenced by scripts/seed-knowledge-base.ts upsert

alter table public.osha_knowledge_base
  add constraint osha_knowledge_base_title_key unique (title);
