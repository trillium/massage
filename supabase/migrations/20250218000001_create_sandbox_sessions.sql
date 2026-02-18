-- Sandbox sessions table for demo booking simulator
-- Stores temporary booking data (events + emails) per session
-- Sessions auto-expire and are cleaned up by the application

create table if not exists public.sandbox_sessions (
  session_id text primary key,
  events jsonb not null default '[]'::jsonb,
  emails jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for cleanup queries
create index idx_sandbox_sessions_created_at on public.sandbox_sessions (created_at);

-- Auto-update updated_at
create or replace function public.sandbox_sessions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sandbox_sessions_updated_at_trigger
  before update on public.sandbox_sessions
  for each row execute function public.sandbox_sessions_updated_at();

-- RLS: no user access at all — only service role (admin client) can read/write
alter table public.sandbox_sessions enable row level security;

-- No RLS policies = no access via anon or authenticated roles
-- All access goes through getSupabaseAdminClient() (service role bypasses RLS)
