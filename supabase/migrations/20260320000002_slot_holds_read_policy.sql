-- Allow anon and authenticated roles to SELECT active slot holds.
-- Required for Supabase Realtime subscriptions on slot_holds.
-- Write operations remain service-role-only (via security definer RPCs).

create policy "Anyone can view active holds"
  on public.slot_holds
  for select
  to anon, authenticated
  using (expires_at > now());
