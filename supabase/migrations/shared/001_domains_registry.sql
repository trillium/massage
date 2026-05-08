CREATE TABLE IF NOT EXISTS public.tenants (
  tenant_slug TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on tenants"
  ON public.tenants FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read tenants"
  ON public.tenants FOR SELECT
  USING (auth.role() IN ('authenticated', 'anon'));


CREATE TABLE IF NOT EXISTS public.domains (
  domain      TEXT PRIMARY KEY,
  tenant_slug TEXT NOT NULL REFERENCES public.tenants(tenant_slug) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domains_tenant_slug ON public.domains(tenant_slug);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on domains"
  ON public.domains FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read domains"
  ON public.domains FOR SELECT
  USING (auth.role() IN ('authenticated', 'anon'));
