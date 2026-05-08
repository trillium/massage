CREATE TYPE IF NOT EXISTS appointment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

CREATE TABLE IF NOT EXISTS appointments (
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
  status            appointment_status NOT NULL DEFAULT 'pending',
  promo             TEXT,
  booking_url       TEXT,
  slug_config       JSONB,
  source            TEXT DEFAULT 'web',
  instant_confirm   BOOLEAN NOT NULL DEFAULT false,
  admin_notes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_calendar_event_id ON appointments(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_email ON appointments(client_email);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on appointments"
  ON appointments FOR ALL
  USING (auth.role() = 'service_role');


CREATE TYPE IF NOT EXISTS reminder_channel AS ENUM ('email', 'sms', 'push', 'whatsapp');
CREATE TYPE IF NOT EXISTS reminder_status AS ENUM ('scheduled', 'sent', 'failed', 'cancelled');
CREATE TYPE IF NOT EXISTS reminder_type AS ENUM ('24h_before', '2h_before', 'follow_up', 'custom');

CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  channel         reminder_channel NOT NULL,
  reminder_type   reminder_type NOT NULL,
  status          reminder_status NOT NULL DEFAULT 'scheduled',
  scheduled_for   TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(scheduled_for, status) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_reminders_appointment ON reminders(appointment_id);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reminders"
  ON reminders FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS reminder_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id     UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  channel         reminder_channel NOT NULL,
  recipient       TEXT NOT NULL,
  status          TEXT NOT NULL,
  error_message   TEXT,
  response_data   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder ON reminder_logs(reminder_id);

ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reminder_logs"
  ON reminder_logs FOR ALL
  USING (auth.role() = 'service_role');


CREATE TYPE IF NOT EXISTS invoice_status AS ENUM (
  'DRAFT', 'UNPAID', 'SCHEDULED', 'PARTIALLY_PAID',
  'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED',
  'CANCELED', 'FAILED', 'PAYMENT_PENDING'
);

CREATE TABLE IF NOT EXISTS invoices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES appointments(id) UNIQUE,
  square_invoice_id  TEXT NOT NULL UNIQUE,
  square_order_id    TEXT NOT NULL,
  square_customer_id TEXT NOT NULL,
  status             invoice_status NOT NULL DEFAULT 'DRAFT',
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

CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_square_invoice ON invoices(square_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS invoice_audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES appointments(id),
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

CREATE INDEX IF NOT EXISTS idx_audit_booking ON invoice_audit_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_audit_square_invoice ON invoice_audit_log(square_invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON invoice_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON invoice_audit_log(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_idempotency ON invoice_audit_log(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE invoice_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoice_audit_log"
  ON invoice_audit_log FOR ALL
  USING (auth.role() = 'service_role');
