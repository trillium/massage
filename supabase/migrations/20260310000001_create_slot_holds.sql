-- Slot holds: short-lived locks to prevent double-booking (TOCTOU race)
-- A hold is claimed when the user clicks a time slot, gating the booking modal.
-- Holds expire after 5 minutes. On successful booking, the hold is released.

create table public.slot_holds (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  expires_at  timestamptz not null default (now() + interval '5 minutes'),
  created_at  timestamptz not null default now()
);

create index idx_slot_holds_time_range on public.slot_holds (start_time, end_time);
create index idx_slot_holds_session_id on public.slot_holds (session_id);
create index idx_slot_holds_expires_at on public.slot_holds (expires_at);

-- RLS: service role only (same pattern as appointments)
alter table public.slot_holds enable row level security;

-- Atomic claim: delete caller's old hold, check conflicts, insert new hold.
-- Returns JSON: { "success": true, "hold_id": "..." } or { "success": false, "reason": "slot_held" }
create or replace function public.claim_slot_hold(
  p_session_id uuid,
  p_start      timestamptz,
  p_end        timestamptz
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_hold_id uuid;
  v_conflict boolean;
begin
  -- Release any existing hold for this session
  delete from public.slot_holds
  where session_id = p_session_id;

  -- Check for conflicting active holds (with row-level lock)
  select exists(
    select 1
    from public.slot_holds
    where expires_at > now()
      and start_time < p_end
      and end_time > p_start
    for update skip locked
  ) into v_conflict;

  if v_conflict then
    return jsonb_build_object('success', false, 'reason', 'slot_held');
  end if;

  -- Insert the new hold
  insert into public.slot_holds (session_id, start_time, end_time)
  values (p_session_id, p_start, p_end)
  returning id into v_hold_id;

  return jsonb_build_object('success', true, 'hold_id', v_hold_id);
end;
$$;

-- Release a hold by session_id
create or replace function public.release_slot_hold(
  p_session_id uuid
) returns void
language plpgsql
security definer
as $$
begin
  delete from public.slot_holds
  where session_id = p_session_id;
end;
$$;
