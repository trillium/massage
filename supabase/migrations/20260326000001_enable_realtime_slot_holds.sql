-- Enable Realtime postgres_changes for slot_holds table.
-- Required for useHeldSlots hook to receive INSERT/UPDATE/DELETE events.

alter publication supabase_realtime add table public.slot_holds;
