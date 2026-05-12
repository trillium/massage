-- Slot hold RPC functions for tenant schemas.
-- The slot_holds table is replicated per tenant but the RPC functions were
-- only defined in public. Tenant clients (schema: trillium_massage) cannot
-- resolve public.* RPCs, so holds silently failed.

create or replace function trillium_massage.claim_slot_hold(
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
  delete from trillium_massage.slot_holds
  where session_id = p_session_id;

  select exists(
    select 1
    from trillium_massage.slot_holds
    where expires_at > now()
      and start_time < p_end
      and end_time > p_start
    for update skip locked
  ) into v_conflict;

  if v_conflict then
    return jsonb_build_object('success', false, 'reason', 'slot_held');
  end if;

  insert into trillium_massage.slot_holds (session_id, start_time, end_time, expires_at)
  values (p_session_id, p_start, p_end, now() + interval '120 seconds')
  returning id into v_hold_id;

  return jsonb_build_object('success', true, 'hold_id', v_hold_id);
end;
$$;

create or replace function trillium_massage.extend_slot_hold(
  p_session_id uuid
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_updated int;
begin
  update trillium_massage.slot_holds
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

create or replace function trillium_massage.release_slot_hold(
  p_session_id uuid
) returns void
language plpgsql
security definer
as $$
begin
  delete from trillium_massage.slot_holds
  where session_id = p_session_id;
end;
$$;

GRANT EXECUTE ON FUNCTION trillium_massage.claim_slot_hold(uuid, timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION trillium_massage.extend_slot_hold(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION trillium_massage.release_slot_hold(uuid) TO service_role;
