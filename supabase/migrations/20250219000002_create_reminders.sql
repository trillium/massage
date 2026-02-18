-- Reminders system: scheduled notifications with pluggable channels
-- Trigger auto-creates reminders when appointment status becomes 'confirmed'

create type reminder_channel as enum ('email', 'sms', 'push', 'whatsapp');
create type reminder_status as enum ('scheduled', 'sent', 'failed', 'cancelled');
create type reminder_type as enum ('24h_before', '2h_before', 'follow_up', 'custom');

create table public.reminders (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid not null references public.appointments(id) on delete cascade,
  channel         reminder_channel not null,
  reminder_type   reminder_type not null,
  status          reminder_status not null default 'scheduled',
  scheduled_for   timestamptz not null,
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_reminders_due on public.reminders (scheduled_for, status)
  where status = 'scheduled';
create index idx_reminders_appointment on public.reminders (appointment_id);

create trigger reminders_updated_at
  before update on public.reminders
  for each row execute function public.handle_updated_at();

alter table public.reminders enable row level security;

-- Reminder delivery logs
create table public.reminder_logs (
  id              uuid primary key default gen_random_uuid(),
  reminder_id     uuid not null references public.reminders(id) on delete cascade,
  channel         reminder_channel not null,
  recipient       text not null,
  status          text not null,
  error_message   text,
  response_data   jsonb,
  created_at      timestamptz not null default now()
);

create index idx_reminder_logs_reminder on public.reminder_logs (reminder_id);

alter table public.reminder_logs enable row level security;

-- Auto-schedule reminders when appointment is confirmed
create or replace function public.schedule_reminders()
returns trigger as $$
begin
  -- Schedule reminders when status becomes 'confirmed'
  if new.status = 'confirmed' and
     (old is null or old.status is distinct from 'confirmed') then

    -- 24h before (only if appointment is > 24h away)
    if new.start_time > now() + interval '24 hours' then
      insert into public.reminders
        (appointment_id, channel, reminder_type, scheduled_for)
      values
        (new.id, 'email', '24h_before', new.start_time - interval '24 hours');
    end if;

    -- 2h before (only if appointment is > 2h away)
    if new.start_time > now() + interval '2 hours' then
      insert into public.reminders
        (appointment_id, channel, reminder_type, scheduled_for)
      values
        (new.id, 'email', '2h_before', new.start_time - interval '2 hours');
    end if;
  end if;

  -- Cancel pending reminders when appointment is cancelled
  if new.status = 'cancelled' and
     (old is null or old.status is distinct from 'cancelled') then
    update public.reminders
    set status = 'cancelled', updated_at = now()
    where appointment_id = new.id and status = 'scheduled';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_schedule_reminders
  after insert or update of status on public.appointments
  for each row execute function public.schedule_reminders();
