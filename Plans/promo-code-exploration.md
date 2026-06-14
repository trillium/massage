# Promo Code Field — Exploration Report

## TL;DR

The promo field infrastructure is **~80% already in place**. The field exists in Redux state, the DB column exists, the API stores it, and it's already included in emails and calendar events. What's missing is the UI input component, validation logic, and a promo code lookup mechanism.

The current `promo` value is populated from slug-based discount configs (e.g. "20% off") — not from user input. That collision is the main gotcha to fix.

---

## What Already Exists

| Layer                                       | Status | Location                                                        |
| ------------------------------------------- | ------ | --------------------------------------------------------------- |
| Redux state (`promo: ''`)                   | ✅     | `redux/slices/bookingFormSlice.ts:22`                           |
| Form type (`promo?: string`)                | ✅     | `lib/formTypes.ts:34`                                           |
| Zod schema (`promo: z.string().optional()`) | ✅     | `lib/bookingFormSchema.ts:30`                                   |
| API submission                              | ✅     | `components/booking/useBookingSubmit.ts:66`                     |
| DB column (`promo text`)                    | ✅     | `supabase/migrations/20250219000001_create_appointments.sql:27` |
| Email/calendar inclusion                    | ✅     | `lib/handleAppointmentRequest.ts:283`                           |
| XSS escaping                                | ✅     | `lib/handleAppointmentRequest.ts:106`                           |
| UI field component                          | ❌     | needs creating                                                  |
| Promo code validation/lookup                | ❌     | needs creating                                                  |
| Dynamic discount display                    | ❌     | needs creating                                                  |

---

## The Collision Problem

`components/booking/useBookingInitialValues.ts:76-80` currently **overwrites** the promo field with the slug-level discount display text:

```ts
promo: config?.discount
  ? config.discount.type === 'percent'
    ? `${(config.discount.amountPercent || 0) * 100}% off`
    : `$${config.discount.amountDollars || 0} off`
  : undefined,
```

This means if a user types a code, it gets clobbered on re-render. This needs to be split: keep user input in `promo`, move the display text somewhere else (e.g. `discountDisplay`).

---

## Where to Add the UI Field

1. **Create** `components/booking/fields/PromoCodeField.tsx` — mirror the pattern from `HotelField.tsx` or `NotesField.tsx`
2. **Add to** `components/booking/BookingFormFields.tsx` — after NotesField, before PaymentMethod. Destructure `values.promo`, `errors.promo`, `touched.promo`
3. **Render conditionally** — consider a `showPromoField` config flag, same pattern as `showHotelField` / `showParkingField`

---

## Discount / Pricing System

- `components/ui/atoms/GeneratePriceAtom.tsx` — `discountMaths()` handles percent and dollar discounts; already renders strikethrough price
- `components/booking/BookingSummary.tsx:48` — passes `discount` from `config.discount` to `<GeneratePrice />`
- Discount type: `lib/configTypes.ts:17-21` — `{ type: 'percent' | 'dollar', amountDollars?, amountPercent? }`

To show a dynamic discount when a valid promo code is entered, you'd look up the code → get a `DiscountType` back → pass it to `BookingSummary` alongside/instead of the config discount.

---

## Existing Promo Infrastructure

- `lib/utilities/promoValidation.ts` — `isPromoExpired()`, `isPromoActive()`, `getPromoExpirationMessage()` — date-based promo window utilities
- `lib/slugConfigurations/fetchSlugConfigurationData.ts` — slug-based discounts like `free_thirty` ($70 off), `midnight-runners` (25% off)
- `app/admin/promo-routes/page.tsx` — admin view of promotional routes and expiration dates

None of this is a code-lookup system — it's all config-driven. A user-submitted promo code field needs a new lookup layer.

---

## Recommended Implementation Phases

### Phase 1 — UI Field (no backend, ~1-2h)

- Create `PromoCodeField.tsx`
- Add to `BookingFormFields.tsx`
- Fix `useBookingInitialValues.ts` collision
- Field submits with form, stored in DB as-is

### Phase 2 — Code Validation (~2-3h)

- Create Supabase `promo_codes` table: `code`, `discount_type`, `discount_amount`, `valid_from`, `valid_until`, `max_uses`, `uses_count`, `active`
- `POST /api/validate-promo` endpoint
- `lib/promoCodeValidation.ts` — `validatePromoCode(code)` → `{ valid, discount?, message? }`
- Hook into Formik validation (`useBookingValidation.ts`)

### Phase 3 — Dynamic Discount Display (~1h)

- On valid code, pass returned `DiscountType` to `BookingSummary`
- Show discounted price in real time
- Decide conflict rule: config discount vs promo code (which wins?)

### Phase 4 — Admin (~2h)

- Promo code management UI (create/expire codes)
- Usage stats on appointments table

---

## Open Questions

1. If a slug already has a config discount AND a user enters a promo code — which wins, or do they stack?
2. Should the field always render, or only on routes without a config-level discount?
3. Validate on blur or debounced real-time fetch?
4. Should used-once codes decrement `uses_count` immediately on validation, or only on confirmed booking?

---

## Key Files

| File                                               | Role                                         |
| -------------------------------------------------- | -------------------------------------------- |
| `components/booking/BookingForm.tsx`               | Master form container                        |
| `components/booking/BookingFormFields.tsx`         | Renders all fields — add PromoCodeField here |
| `components/booking/useBookingInitialValues.ts:76` | Collision point — fix promo overwrite        |
| `components/booking/useBookingSubmit.ts:66`        | Already sends promo in payload               |
| `components/booking/BookingSummary.tsx:48`         | Passes discount to price display             |
| `components/booking/fields/HotelField.tsx`         | Reference pattern for new field              |
| `components/booking/fields/classes.ts`             | Shared field styles                          |
| `components/ui/atoms/GeneratePriceAtom.tsx`        | Price + discount display logic               |
| `lib/bookingFormSchema.ts:30`                      | Zod validation — extend here                 |
| `lib/formTypes.ts:34`                              | BookingFormData type                         |
| `lib/configTypes.ts:17`                            | DiscountType definition                      |
| `redux/slices/bookingFormSlice.ts:22`              | Redux state (promo already there)            |
| `lib/handleAppointmentRequest.ts:106`              | XSS escaping + storage                       |
| `supabase/migrations/20250219...sql:27`            | DB column already exists                     |
