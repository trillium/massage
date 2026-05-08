-- Expose trillium_massage schema in PostgREST and grant role permissions.

GRANT USAGE ON SCHEMA trillium_massage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA trillium_massage TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA trillium_massage TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA trillium_massage
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA trillium_massage
  GRANT SELECT ON TABLES TO anon, authenticated;

-- Add trillium_massage to PostgREST's allowed schema list and reload.
ALTER ROLE authenticator SET pgrst.db_schemas = 'public,graphql_public,trillium_massage';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
