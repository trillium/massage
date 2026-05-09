create table if not exists google_credentials (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  access_token text not null,
  refresh_token text not null,
  expiry_date bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table google_credentials enable row level security;

create policy "service role only" on google_credentials
  using (false);
