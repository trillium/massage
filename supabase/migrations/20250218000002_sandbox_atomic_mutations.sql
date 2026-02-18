-- Atomic sandbox mutations to prevent race conditions on read-modify-write

-- Add event to session (upserts if session doesn't exist)
CREATE OR REPLACE FUNCTION sandbox_add_event(
  p_session_id uuid,
  p_event jsonb,
  p_max_events int DEFAULT 20
) RETURNS void AS $$
BEGIN
  INSERT INTO sandbox_sessions (session_id, events, emails)
  VALUES (p_session_id, jsonb_build_array(p_event), '[]'::jsonb)
  ON CONFLICT (session_id) DO UPDATE
  SET events = CASE
    WHEN jsonb_array_length(COALESCE(sandbox_sessions.events, '[]'::jsonb)) >= p_max_events
    THEN sandbox_sessions.events
    ELSE COALESCE(sandbox_sessions.events, '[]'::jsonb) || p_event
  END,
  updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Add email to session (upserts if session doesn't exist)
CREATE OR REPLACE FUNCTION sandbox_add_email(
  p_session_id uuid,
  p_email jsonb,
  p_max_emails int DEFAULT 60
) RETURNS void AS $$
BEGIN
  INSERT INTO sandbox_sessions (session_id, events, emails)
  VALUES (p_session_id, '[]'::jsonb, jsonb_build_array(p_email))
  ON CONFLICT (session_id) DO UPDATE
  SET emails = CASE
    WHEN jsonb_array_length(COALESCE(sandbox_sessions.emails, '[]'::jsonb)) >= p_max_emails
    THEN sandbox_sessions.emails
    ELSE COALESCE(sandbox_sessions.emails, '[]'::jsonb) || p_email
  END,
  updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Update event status and return the matched event
CREATE OR REPLACE FUNCTION sandbox_update_event_status(
  p_session_id uuid,
  p_calendar_event_id text,
  p_status text
) RETURNS jsonb AS $$
DECLARE
  v_events jsonb;
  v_idx int;
  v_event jsonb;
BEGIN
  SELECT events INTO v_events
  FROM sandbox_sessions
  WHERE session_id = p_session_id
  FOR UPDATE;

  IF v_events IS NULL THEN
    RETURN NULL;
  END IF;

  -- Find the event index by calendarEventId
  SELECT i INTO v_idx
  FROM generate_series(0, jsonb_array_length(v_events) - 1) AS i
  WHERE v_events->i->>'calendarEventId' = p_calendar_event_id;

  IF v_idx IS NULL THEN
    RETURN NULL;
  END IF;

  v_event := v_events->v_idx;
  v_event := jsonb_set(v_event, '{status}', to_jsonb(p_status));

  v_events := jsonb_set(v_events, ARRAY[v_idx::text], v_event);

  UPDATE sandbox_sessions
  SET events = v_events, updated_at = now()
  WHERE session_id = p_session_id;

  RETURN v_event;
END;
$$ LANGUAGE plpgsql;

-- Update event description (used by fakeUpdateCalendarEvent)
CREATE OR REPLACE FUNCTION sandbox_update_event_description(
  p_session_id uuid,
  p_calendar_event_id text,
  p_description text
) RETURNS void AS $$
DECLARE
  v_events jsonb;
  v_idx int;
  v_event jsonb;
BEGIN
  SELECT events INTO v_events
  FROM sandbox_sessions
  WHERE session_id = p_session_id
  FOR UPDATE;

  IF v_events IS NULL THEN
    RETURN;
  END IF;

  SELECT i INTO v_idx
  FROM generate_series(0, jsonb_array_length(v_events) - 1) AS i
  WHERE v_events->i->>'calendarEventId' = p_calendar_event_id;

  IF v_idx IS NULL THEN
    RETURN;
  END IF;

  v_event := v_events->v_idx;
  v_event := jsonb_set(v_event, '{description}', to_jsonb(p_description));

  v_events := jsonb_set(v_events, ARRAY[v_idx::text], v_event);

  UPDATE sandbox_sessions
  SET events = v_events, updated_at = now()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;
