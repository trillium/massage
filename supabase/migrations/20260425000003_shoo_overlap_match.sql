CREATE OR REPLACE FUNCTION shoo_slot_hold(p_start timestamptz, p_end timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_shoo_count int;
  v_deleted boolean := false;
BEGIN
  SELECT id, shoo_count + 1 INTO v_id, v_shoo_count
  FROM slot_holds
  WHERE start_time < p_end
    AND end_time > p_start
    AND expires_at > now()
  FOR UPDATE
  LIMIT 1;

  IF v_id IS NULL THEN
    RETURN json_build_object('shoo_count', 0, 'deleted', false);
  END IF;

  IF v_shoo_count >= 5 THEN
    DELETE FROM slot_holds WHERE id = v_id;
    v_deleted := true;
  ELSE
    UPDATE slot_holds SET shoo_count = v_shoo_count WHERE id = v_id;
  END IF;

  RETURN json_build_object('shoo_count', v_shoo_count, 'deleted', v_deleted);
END;
$$;
