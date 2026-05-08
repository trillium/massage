CREATE SCHEMA IF NOT EXISTS sarah_music;

INSERT INTO public.tenants (tenant_slug) VALUES ('sarah_music') ON CONFLICT DO NOTHING;

INSERT INTO public.domains (domain, tenant_slug) VALUES
  ('musicwithsarahb.com', 'sarah_music')
ON CONFLICT DO NOTHING;


-- google_credentials
CREATE TABLE IF NOT EXISTS sarah_music.google_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  expiry_date   BIGINT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_google_credentials_email
  ON sarah_music.google_credentials(email);

ALTER TABLE sarah_music.google_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on google_credentials"
  ON sarah_music.google_credentials FOR ALL
  USING (auth.role() = 'service_role');


-- appointments + children
CREATE TABLE IF NOT EXISTS sarah_music.appointments (
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
  ON sarah_music.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON sarah_music.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_calendar_event_id
  ON sarah_music.appointments(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_email
  ON sarah_music.appointments(client_email);

ALTER TABLE sarah_music.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on appointments"
  ON sarah_music.appointments FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS sarah_music.reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES sarah_music.appointments(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL,
  reminder_type   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_for   TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_due
  ON sarah_music.reminders(scheduled_for, status) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_reminders_appointment
  ON sarah_music.reminders(appointment_id);

ALTER TABLE sarah_music.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reminders"
  ON sarah_music.reminders FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS sarah_music.reminder_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id     UUID NOT NULL REFERENCES sarah_music.reminders(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL,
  recipient       TEXT NOT NULL,
  status          TEXT NOT NULL,
  error_message   TEXT,
  response_data   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder
  ON sarah_music.reminder_logs(reminder_id);

ALTER TABLE sarah_music.reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reminder_logs"
  ON sarah_music.reminder_logs FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS sarah_music.invoices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES sarah_music.appointments(id) UNIQUE,
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
  ON sarah_music.invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_square_invoice
  ON sarah_music.invoices(square_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status
  ON sarah_music.invoices(status);

ALTER TABLE sarah_music.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoices"
  ON sarah_music.invoices FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS sarah_music.invoice_audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES sarah_music.appointments(id),
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
  ON sarah_music.invoice_audit_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_audit_square_invoice
  ON sarah_music.invoice_audit_log(square_invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type
  ON sarah_music.invoice_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at
  ON sarah_music.invoice_audit_log(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_idempotency
  ON sarah_music.invoice_audit_log(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE sarah_music.invoice_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoice_audit_log"
  ON sarah_music.invoice_audit_log FOR ALL
  USING (auth.role() = 'service_role');
