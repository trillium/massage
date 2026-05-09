create table if not exists google_oauth_apps (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  client_id text not null,
  client_secret text not null,
  created_at timestamptz not null default now()
);

alter table google_oauth_apps enable row level security;

create policy "service role only" on google_oauth_apps
  using (false);

alter table google_credentials
  alter column access_token drop not null,
  alter column refresh_token drop not null,
  alter column expiry_date drop not null;

alter table google_credentials
  add column if not exists oauth_app_id uuid references google_oauth_apps(id);
