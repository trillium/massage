-- Add admin email for trilliummassagela@gmail.com
insert into public.admin_emails (email)
values ('trilliummassagela@gmail.com')
on conflict (email) do nothing;
