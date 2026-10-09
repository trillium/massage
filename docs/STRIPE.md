# Stripe Payments

Stripe Checkout runs alongside the existing Square invoice flow (`/api/invoice`). Square is untouched.

## Working defaults (owner to confirm)

All three live in `lib/stripe/paymentConfig.ts`.

1. Payment is offered after a booking is `confirmed` (`PAYMENT_OFFERED_WHEN_STATUS`).
2. The full `appointments.price` (cents) is charged (`chargeAmountCents`).
3. Bookings with a null or $0 price, including barter, skip payment (`requiresPayment`).

## Flow

```
confirmed booking --POST /api/stripe/checkout {bookingId}--> Checkout Session url
client pays on Stripe --> POST /api/webhooks/stripe (signature verified)
  --> appointments.paid_at + stripe_checkout_session_id set
```

The checkout route is server-side only. The client never sees `STRIPE_SECRET_KEY`.
Nothing in the UI links to the checkout route yet (see follow-ups).

## Environment variables

| Variable                | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `STRIPE_SECRET_KEY`     | Server-only API key. Test mode: `sk_test_...`        |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the webhook endpoint: `whsec_...` |

## Database

Apply `supabase/migrations/20260623000001_add_stripe_payment_columns_to_appointments.sql`
(adds `stripe_checkout_session_id` and `paid_at` to each tenant `appointments` table).

## Local development (test mode)

1. Put test keys in `.env.local`: `STRIPE_SECRET_KEY=sk_test_...`.
2. Run `pnpm dev` (port 9876).
3. Run `stripe listen --forward-to localhost:9876/api/webhooks/stripe` and copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`. Restart `pnpm dev`.
4. Create a checkout session for a confirmed, priced booking:
   `curl -X POST localhost:9876/api/stripe/checkout -H 'content-type: application/json' -d '{"bookingId":"<uuid>"}'`
5. Open the returned `url` and pay with card `4242 4242 4242 4242`, any future expiry and CVC.
6. Confirm the `stripe listen` output shows `checkout.session.completed` answered 200 and the appointment row has `paid_at` set.

## Vercel deployment

1. Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` under Project Settings > Environment Variables. Use test keys for Preview and Development.
2. In the Stripe Dashboard (test mode) add a webhook endpoint `https://<deployment>/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
3. Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.
4. Verify with a test payment as in the local steps. Switch to live keys only when the owner approves.

## Follow-ups (out of scope)

- Link or button that calls the checkout route from the confirmation page or email.
- Refunds, subscriptions, tax, invoicing, admin payment dashboard.
- Decide the real payment timing and deposit policy.
