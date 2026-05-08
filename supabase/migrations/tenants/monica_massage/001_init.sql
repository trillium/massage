CREATE SCHEMA IF NOT EXISTS monica_massage;

INSERT INTO public.tenants (tenant_slug) VALUES ('monica_massage') ON CONFLICT DO NOTHING;

INSERT INTO public.domains (domain, tenant_slug) VALUES
  ('monicamassage.com', 'monica_massage')
ON CONFLICT DO NOTHING;


-- google_credentials
CREATE TABLE IF NOT EXISTS monica_massage.google_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  expiry_date   BIGINT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_google_credentials_email
  ON monica_massage.google_credentials(email);

ALTER TABLE monica_massage.google_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on google_credentials"
  ON monica_massage.google_credentials FOR ALL
  USING (auth.role() = 'service_role');


-- appointments + children
CREATE TABLE IF NOT EXISTS monica_massage.appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id TEXT UNIQUE,
  client_email      TEXT NOT NULL,
  client_phone      TEXT,
  client_first_name TEXT NOT NULL,
  client_last_name  TEXT NOT NULL,
  start_time        TIMESTAMPTZ NOT NULL,
  end_time          TIMESTAMPTZ NOT NULL,
  duration_minutes  INTEGER NOT NULL,
  timezone          TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  location          TEXT,
  price             INTEGER,
  status            TEXT NOT NULL DEFAULT 'pending',
  promo             TEXT,
  booking_url       TEXT,
  slug_config       JSONB,
  source            TEXT DEFAULT 'web',
  instant_confirm   BOOLEAN NOT NULL DEFAULT false,
  admin_notes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,

  CONSTRAINT appointments_status_check CHECK (
    status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')
  )
);

CREATE INDEX IF NOT EXISTS idx_appointments_start_time
  ON monica_massage.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON monica_massage.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_calendar_event_id
  ON monica_massage.appointments(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_email
  ON monica_massage.appointments(client_email);

ALTER TABLE monica_massage.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on appointments"
  ON monica_massage.appointments FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS monica_massage.reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES monica_massage.appointments(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL,
  reminder_type   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_for   TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_due
  ON monica_massage.reminders(scheduled_for, status) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_reminders_appointment
  ON monica_massage.reminders(appointment_id);

ALTER TABLE monica_massage.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reminders"
  ON monica_massage.reminders FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS monica_massage.reminder_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id     UUID NOT NULL REFERENCES monica_massage.reminders(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL,
  recipient       TEXT NOT NULL,
  status          TEXT NOT NULL,
  error_message   TEXT,
  response_data   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder
  ON monica_massage.reminder_logs(reminder_id);

ALTER TABLE monica_massage.reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reminder_logs"
  ON monica_massage.reminder_logs FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS monica_massage.invoices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES monica_massage.appointments(id) UNIQUE,
  square_invoice_id  TEXT NOT NULL UNIQUE,
  square_order_id    TEXT NOT NULL,
  square_customer_id TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'DRAFT',
  public_url         TEXT,
  invoice_number     TEXT,
  amount_cents       INTEGER NOT NULL,
  currency           TEXT NOT NULL DEFAULT 'USD',
  email_sent_to      TEXT,
  email_updated_at   TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at            TIMESTAMPTZ,
  canceled_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoices_booking
  ON monica_massage.invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_square_invoice
  ON monica_massage.invoices(square_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status
  ON monica_massage.invoices(status);

ALTER TABLE monica_massage.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoices"
  ON monica_massage.invoices FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS monica_massage.invoice_audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES monica_massage.appointments(id),
  square_invoice_id TEXT,
  square_order_id   TEXT,
  event_type        TEXT NOT NULL,
  event_source      TEXT NOT NULL,
  status_before     TEXT,
  status_after      TEXT,
  payload           JSONB,
  error_detail      JSONB,
  idempotency_key   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_booking
  ON monica_massage.invoice_audit_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_audit_square_invoice
  ON monica_massage.invoice_audit_log(square_invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type
  ON monica_massage.invoice_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at
  ON monica_massage.invoice_audit_log(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_idempotency
  ON monica_massage.invoice_audit_log(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE monica_massage.invoice_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoice_audit_log"
  ON monica_massage.invoice_audit_log FOR ALL
  USING (auth.role() = 'service_role');
