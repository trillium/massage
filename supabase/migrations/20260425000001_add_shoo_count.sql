ALTER TABLE slot_holds ADD COLUMN shoo_count int NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION shoo_slot_hold(p_start timestamptz, p_end timestamptz)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_shoo_count int;
  v_deleted boolean := false;
BEGIN
  SELECT shoo_count + 1 INTO v_shoo_count
  FROM slot_holds
  WHERE start_time = p_start
    AND end_time = p_end
    AND expires_at > now()
  FOR UPDATE;

  IF v_shoo_count IS NULL THEN
    RETURN json_build_object('shoo_count', 0, 'deleted', false);
  END IF;

  IF v_shoo_count >= 5 THEN
    DELETE FROM slot_holds
    WHERE start_time = p_start
      AND end_time = p_end
      AND expires_at > now();
    v_deleted := true;
  ELSE
    UPDATE slot_holds
    SET shoo_count = v_shoo_count
    WHERE start_time = p_start
      AND end_time = p_end
      AND expires_at > now();
  END IF;

  RETURN json_build_object('shoo_count', v_shoo_count, 'deleted', v_deleted);
END;
$$;
