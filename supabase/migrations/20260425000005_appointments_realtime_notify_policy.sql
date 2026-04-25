-- Allow authenticated users (admin) to receive realtime notifications for appointments.
-- The admin dashboard listens for changes to trigger a server-side refresh.
create policy "authenticated_select_appointments"
  on public.appointments
  for select
  to authenticated
  using (true);
