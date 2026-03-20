-- Atomic slot reservation: prevents double-booking race condition (TOCTOU)
--
-- Before this, checkSlotAvailability (a read) ran before calendar event
-- creation (a write), allowing two concurrent requests to both pass the check.
-- This RPC atomically checks for overlapping appointments and inserts a new one,
-- making the reservation itself the point of serialization.

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
  -- Lock overlapping non-cancelled appointments to serialize concurrent requests
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

  -- Insert the reservation atomically
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
