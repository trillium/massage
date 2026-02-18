-- Appointments table: persistent record of all bookings
-- Source of truth for reminders, analytics, client history
-- Google Calendar remains authoritative for scheduling; this is supplementary

create type appointment_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

create table public.appointments (
  id                uuid primary key default gen_random_uuid(),
  calendar_event_id text unique,
  client_email      text not null,
  client_phone      text,
  client_first_name text not null,
  client_last_name  text not null,
  start_time        timestamptz not null,
  end_time          timestamptz not null,
  duration_minutes  integer not null,
  timezone          text not null default 'America/Los_Angeles',
  location          text,
  price             integer,
  status            appointment_status not null default 'pending',
  promo             text,
  booking_url       text,
  slug_config       jsonb,
  source            text default 'web',
  instant_confirm   boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  confirmed_at      timestamptz,
  cancelled_at      timestamptz
);

create index idx_appointments_start_time on public.appointments (start_time);
create index idx_appointments_status on public.appointments (status);
create index idx_appointments_calendar_event_id on public.appointments (calendar_event_id);
create index idx_appointments_client_email on public.appointments (client_email);

-- Reuse existing handle_updated_at() trigger function
create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.handle_updated_at();

-- RLS: service role only (same pattern as sandbox_sessions)
alter table public.appointments enable row level security;
