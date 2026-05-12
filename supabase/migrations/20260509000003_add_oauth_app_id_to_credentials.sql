alter table google_credentials
  add column if not exists oauth_app_id uuid references public.google_oauth_apps(id);
