-- Invoice tables for Square invoice pipeline

CREATE TYPE invoice_status AS ENUM (
  'DRAFT', 'UNPAID', 'SCHEDULED', 'PARTIALLY_PAID',
  'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED',
  'CANCELED', 'FAILED', 'PAYMENT_PENDING'
);

CREATE TABLE invoices (
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

CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_square_invoice ON invoices(square_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE TABLE invoice_audit_log (
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

CREATE INDEX idx_audit_booking ON invoice_audit_log(booking_id);
CREATE INDEX idx_audit_square_invoice ON invoice_audit_log(square_invoice_id);
CREATE INDEX idx_audit_event_type ON invoice_audit_log(event_type);
CREATE INDEX idx_audit_created_at ON invoice_audit_log(created_at);
CREATE UNIQUE INDEX idx_audit_idempotency ON invoice_audit_log(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Auto-update updated_at on invoices
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can read invoices"
  ON invoices FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role full access on invoice_audit_log"
  ON invoice_audit_log FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can read invoice_audit_log"
  ON invoice_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
