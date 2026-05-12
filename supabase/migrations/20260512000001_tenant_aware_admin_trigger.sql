-- Rewrite handle_new_user() to check admin_emails across all tenant schemas.
-- Operational contract: seed <tenant>.admin_emails before the admin signs up.
-- The trigger runs as postgres (SECURITY DEFINER) so it can read every tenant schema.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email   TEXT;
  is_admin_val BOOLEAN := false;
  tenant_rec   RECORD;
  found_admin  BOOLEAN;
BEGIN
  user_email := new.email;

  FOR tenant_rec IN SELECT tenant_slug FROM public.tenants LOOP
    BEGIN
      EXECUTE format(
        'SELECT EXISTS(SELECT 1 FROM %I.admin_emails WHERE email = $1)',
        tenant_rec.tenant_slug
      ) INTO found_admin USING user_email;

      IF found_admin THEN
        is_admin_val := true;
        EXIT;
      END IF;
    EXCEPTION WHEN undefined_table OR invalid_schema_name THEN
      NULL;
    END;
  END LOOP;

  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    user_email,
    CASE WHEN is_admin_val THEN 'admin'::user_role ELSE 'user'::user_role END
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
