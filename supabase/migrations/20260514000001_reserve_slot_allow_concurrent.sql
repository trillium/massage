-- Allow concurrent bookings for multi-chair events (e.g. NerdStage chair massage)
--
-- The original RPC blocked ALL overlapping non-cancelled appointments globally,
-- which prevented multiple people from booking the same time slot at a chair massage
-- event where many chairs are available simultaneously.
--
-- Fix: skip the overlap check when slug_config contains allowConcurrentBookings=true.
-- The p_slug_config jsonb is already passed to the RPC, so no new parameter needed.

create or replace function public.reserve_appointment_slot(
  p_start         timestamptz,
  p_end           timestamptz,
  p_client_email  text,
  p_client_phone  text default null,
  p_client_first  text default '',
  p_client_last   text default '',
  p_duration_min  int default 60,
  p_timezone      text default 'UTC',
  p_location      text default null,
  p_price         int default null,
  p_status        text default 'pending',
  p_promo         text default null,
  p_booking_url   text default null,
  p_slug_config   jsonb default null,
  p_source        text default 'web',
  p_instant       boolean default false,
  p_confirmed_at  timestamptz default null
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_appointment_id uuid;
  v_conflict boolean;
begin
  -- Skip overlap check for events that allow concurrent bookings (e.g. multi-chair events)
  if not coalesce((p_slug_config->>'allowConcurrentBookings')::boolean, false) then
    select exists(
      select 1
      from public.appointments
      where status not in ('cancelled')
        and start_time < p_end
        and end_time > p_start
      for update
    ) into v_conflict;

    if v_conflict then
      return jsonb_build_object('success', false, 'reason', 'slot_taken');
    end if;
  end if;

  insert into public.appointments (
    client_email, client_phone, client_first_name, client_last_name,
    start_time, end_time, duration_minutes, timezone, location,
    price, status, promo, booking_url, slug_config, source,
    instant_confirm, confirmed_at
  ) values (
    p_client_email, p_client_phone, p_client_first, p_client_last,
    p_start, p_end, p_duration_min, p_timezone, p_location,
    p_price, p_status::appointment_status, p_promo, p_booking_url,
    p_slug_config, p_source, p_instant, p_confirmed_at
  )
  returning id into v_appointment_id;

  return jsonb_build_object('success', true, 'appointment_id', v_appointment_id);
end;
$$;
