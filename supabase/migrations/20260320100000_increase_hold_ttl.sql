-- Increase hold TTL from 20 seconds to 120 seconds.
-- 20s was too aggressive — users filling out the booking form would lose
-- their hold just by reading or thinking. 120s gives comfortable breathing
-- room while auto-extend on activity keeps active sessions alive indefinitely.

alter table public.slot_holds
  alter column expires_at set default (now() + interval '120 seconds');

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
  delete from public.slot_holds
  where session_id = p_session_id;

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

  insert into public.slot_holds (session_id, start_time, end_time, expires_at)
  values (p_session_id, p_start, p_end, now() + interval '120 seconds')
  returning id into v_hold_id;

  return jsonb_build_object('success', true, 'hold_id', v_hold_id);
end;
$$;

create or replace function public.extend_slot_hold(
  p_session_id uuid
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_updated int;
begin
  update public.slot_holds
  set expires_at = now() + interval '120 seconds'
  where session_id = p_session_id
    and expires_at > now();

  get diagnostics v_updated = row_count;

  if v_updated > 0 then
    return jsonb_build_object('extended', true);
  end if;

  return jsonb_build_object('extended', false, 'reason', 'hold_expired');
end;
$$;
