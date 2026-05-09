drop policy if exists "Anon can read slot_holds" on trillium_massage.slot_holds;

create policy "Anyone can view active holds"
  on trillium_massage.slot_holds
  for select
  to anon, authenticated
  using (expires_at > now());
