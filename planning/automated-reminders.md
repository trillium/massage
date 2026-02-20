# Automated Reminders — Implementation Plan

## Current Booking Flow (two paths)

```
PATH A: Approval Required (default)
  Client submits form
    -> POST /api/request
    -> Creates REQUEST calendar event (no attendee yet)
    -> Sends admin Approval email + Pushover
    -> Sends client "Request Received" email
    -> Admin clicks Approve link
    -> GET /api/confirm
    -> Updates calendar event (adds attendee, sendNotifications=true)
    -> Google Calendar sends invite to client
    -> Redirects admin to /admin/booked

PATH B: Instant Confirm
  Client submits form
    -> POST /api/request (instantConfirm=true)
    -> Creates calendar event directly (with attendee)
    -> Sends client ClientConfirmEmail
    -> Sends admin Pushover notification
```

**Key observations:**

- No `appointments` table exists — appointments live only in Google Calendar
- Email: nodemailer + Gmail OAuth2 (`lib/email/index.ts`)
- Push: Pushover (`lib/messaging/push/admin/pushover.ts`)
- No Supabase Edge Functions exist yet
- Supabase has `pg_cron` available

## Architecture

```
                          BOOKING FLOW (existing)
                          ========================
  Client Form -> /api/request -> Google Calendar
                      |
                      v (NEW: after confirm)
              +------------------+
              | appointments     |  <-- Supabase table
              | table INSERT     |
              +--------+---------+
                       |
                       v (trigger)
              +------------------+
              | schedule_reminders|  <-- Postgres function
              | (inserts into    |      creates reminder rows
              |  reminders table)|
              +--------+---------+
                       |
                       v
              +------------------+
              | reminders table  |  <-- scheduled_for timestamps
              +------------------+


                          CRON LOOP (new)
                          ===============
              +------------------+
              | pg_cron (1 min)  |
              +--------+---------+
                       |
                       v (pg_net HTTP POST)
              +---------------------------+
              | Edge Function:            |
              | process-reminders         |
              |                           |
              |  1. Query due reminders   |
              |  2. For each reminder:    |
              |     - Route to channel    |
              |     - Dispatch via adapter|
              |     - Log result          |
              +--------+---------+--------+
                       |         |
            +----------+    +----+-------+
            v               v            v
       +---------+   +-----------+  +-----------+
       | Email   |   | SMS       |  | Push      |
       | Adapter |   | Adapter   |  | Adapter   |
       | (Gmail) |   | (Twilio)  |  | (Pushover)|
       +---------+   +-----------+  +-----------+
            |               |            |
            v               v            v
       +---------+   +-----------+  +-----------+
       |reminder |   |reminder   |  |reminder   |
       |_logs    |   |_logs      |  |_logs      |
       +---------+   +-----------+  +-----------+
```

**Channel adapter interface:**

```
+-------------------------------------------+
| ReminderChannelAdapter (interface)        |
|-------------------------------------------|
| channel: string                           |
| send(reminder, appointment): Promise<     |
|   { success: boolean; error?: string }    |
| >                                         |
+-------------------------------------------+
        ^            ^            ^
        |            |            |
  EmailChannel  SMSChannel  PushChannel
```

## Database Schema

### appointments table

```sql
create type appointment_status as enum (
  'pending',      -- awaiting approval
  'confirmed',    -- approved / instant-confirmed
  'cancelled',    -- cancelled by client or admin
  'completed',    -- appointment time has passed
  'no_show'       -- marked as no-show
);

create table public.appointments (
  id              uuid primary key default gen_random_uuid(),
  calendar_event_id text unique,
  client_email    text not null,
  client_phone    text,
  client_first_name text not null,
  client_last_name  text not null,
  start_time      timestamptz not null,
  end_time        timestamptz not null,
  duration_minutes integer not null,
  timezone        text not null,
  location        text,
  price           integer,
  status          appointment_status not null default 'pending',
  promo           text,
  booking_url     text,
  slug_config     jsonb,
  source          text,         -- 'web', 'admin', 'onsite'
  instant_confirm boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  cancelled_at    timestamptz
);
```

### reminders table

```sql
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
```

### reminder_logs table

```sql
create table public.reminder_logs (
  id              uuid primary key default gen_random_uuid(),
  reminder_id     uuid not null references public.reminders(id) on delete cascade,
  channel         reminder_channel not null,
  recipient       text not null,
  status          text not null,       -- 'delivered', 'failed', 'bounced'
  error_message   text,
  response_data   jsonb,
  created_at      timestamptz not null default now()
);
```

### Trigger: auto-schedule reminders on confirm

```sql
create or replace function public.schedule_reminders()
returns trigger as $$
begin
  if new.status = 'confirmed' and
     (old.status is null or old.status != 'confirmed') then

    -- 24h before (only if > 24h away)
    if new.start_time > now() + interval '24 hours' then
      insert into public.reminders
        (appointment_id, channel, reminder_type, scheduled_for)
      values
        (new.id, 'email', '24h_before', new.start_time - interval '24 hours');
    end if;

    -- 2h before (only if > 2h away)
    if new.start_time > now() + interval '2 hours' then
      insert into public.reminders
        (appointment_id, channel, reminder_type, scheduled_for)
      values
        (new.id, 'email', '2h_before', new.start_time - interval '2 hours');
    end if;
  end if;

  -- Cancel reminders when appointment cancelled
  if new.status = 'cancelled' and old.status != 'cancelled' then
    update public.reminders
    set status = 'cancelled', updated_at = now()
    where appointment_id = new.id and status = 'scheduled';
  end if;

  return new;
end;
$$ language plpgsql security definer;
```

## Files to Create

| File                                                   | Purpose                                     |
| ------------------------------------------------------ | ------------------------------------------- |
| `supabase/migrations/..._create_appointments.sql`      | appointments table, enums, indexes, RLS     |
| `supabase/migrations/..._create_reminders.sql`         | reminders + reminder_logs, trigger, indexes |
| `supabase/migrations/..._setup_cron.sql`               | pg_cron + pg_net to invoke Edge Function    |
| `supabase/functions/process-reminders/index.ts`        | Main cron entry: query due, dispatch, log   |
| `supabase/functions/_shared/channels/types.ts`         | ReminderChannelAdapter interface            |
| `supabase/functions/_shared/channels/email.ts`         | Gmail OAuth2 email adapter                  |
| `supabase/functions/_shared/channels/registry.ts`      | Channel router                              |
| `supabase/functions/_shared/templates/reminder-24h.ts` | 24h email template                          |
| `supabase/functions/_shared/templates/reminder-2h.ts`  | 2h email template                           |
| `supabase/functions/_shared/db.ts`                     | Supabase client init for Edge Functions     |
| `lib/appointments/createAppointmentRecord.ts`          | Insert appointment after booking            |
| `lib/appointments/updateAppointmentStatus.ts`          | Update status (triggers reminders)          |
| `lib/appointments/types.ts`                            | TypeScript types                            |

## Files to Modify

| File                                       | Change                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `lib/handleAppointmentRequest.ts`          | Insert appointment record (pending or confirmed) after calendar event creation |
| `app/api/confirm/route.ts`                 | Update appointment to 'confirmed' after approval                               |
| `app/api/decline/route.ts`                 | Update appointment to 'cancelled'                                              |
| `app/api/event/[event_id]/cancel/route.ts` | Update appointment to 'cancelled'                                              |
| `app/api/onsite/confirm/route.ts`          | Insert confirmed appointment for onsite bookings                               |
| `lib/supabase/database.types.ts`           | Add 3 new table types                                                          |

## Integration Points

1. `handleAppointmentRequest.ts` ~line 142: instant-confirm → insert `status: 'confirmed'`
2. `handleAppointmentRequest.ts` ~line 178: approval path → insert `status: 'pending'`
3. `/api/confirm` ~line 74: after calendar update → `updateAppointmentStatus('confirmed')`
4. `/api/decline` ~line 22: after calendar delete → `updateAppointmentStatus('cancelled')`
5. `/api/event/[event_id]/cancel` ~line 43: → `updateAppointmentStatus('cancelled')`
6. `/api/onsite/confirm` ~line 56: → insert `status: 'confirmed'`

**Design note:** All Supabase writes should be fire-and-forget. Google Calendar remains source of truth. A reconciliation job can sync missing records later.

## Implementation Phases

### Phase 1: Appointments Table + Email Reminders

1. Database migrations (3 files)
2. `createAppointmentRecord` + `updateAppointmentStatus`
3. Wire into existing booking/confirm/cancel flows
4. Edge Function with email adapter
5. pg_cron setup
6. Tests

### Phase 2: SMS via Twilio

1. SMS adapter in `_shared/channels/sms.ts`
2. Modify trigger to create SMS reminders
3. Client opt-in preferences

### Phase 3: Additional Channels

1. Push (Pushover pattern exists)
2. WhatsApp
3. Client preference management
4. Admin dashboard for reminder visibility
