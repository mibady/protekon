-- 020_employee_log_requests.sql
-- SB 553 workplace-violence log requests: employee/agency asks for a copy of
-- the incident log; employer has 15 days to release a PII-scrubbed packet.

create table if not exists employee_log_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  requester_name text not null,
  requester_email text not null,
  requester_role text not null default 'employee',
  reason text,
  period_start date not null,
  period_end date not null,
  status text not null default 'pending'
    check (status in ('pending','processing','released','declined','expired')),
  due_at timestamptz not null default (now() + interval '15 days'),
  released_at timestamptz,
  released_packet_url text,
  decline_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_employee_log_requests_client
  on employee_log_requests(client_id, status);
create index if not exists idx_employee_log_requests_due
  on employee_log_requests(due_at)
  where status in ('pending','processing');

alter table employee_log_requests enable row level security;

create policy "employee_log_requests_select_own"
  on employee_log_requests for select
  using (client_id = auth.uid());

create policy "employee_log_requests_insert_own"
  on employee_log_requests for insert
  with check (client_id = auth.uid());

create policy "employee_log_requests_update_own"
  on employee_log_requests for update
  using (client_id = auth.uid());

create or replace function employee_log_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_employee_log_requests_updated_at on employee_log_requests;
create trigger trg_employee_log_requests_updated_at
before update on employee_log_requests
for each row execute function employee_log_requests_updated_at();
