# Concept pack: group / office-visit print pieces

Three home-printable concepts (US Letter, 100% scale, no bleed) in the flyer v4 style: same hero, portrait/collage photos (native aspect), and Airbnb QR (decodes to `https://airbnb.com/sv/trillium`). Single practitioner voice: Trillium Smith, LMT, 14 years experience.

## Fill in before printing (placeholders)

The multi-guest reduced rate is NOT decided. Each concept shows a yellow dashed box (edit `RATE_LINES` in `build.py`):

- `Reduced rate per guest: [ $____ ]`
- `Guests per visit: [ ___ to ___ ]`
- `Session length: [ ___ min ]`

Contact number comes from `PRINT_PHONE` (see `.env.example`; default 555-444-3333). Then rebuild: `python3 print/concept-pack/build.py` (needs `pip3 install pymupdf pillow`). Output goes to `print/concept-pack/out/`. Pass a path to build elsewhere.

## A. Tri-fold brochure (`out/A-trifold-brochure.pdf`, 2 pages, landscape)

Print: duplex, landscape, **flip on SHORT edge**.

- Page 1 (outside), left to right: inner flap | back cover (QR + GATHER50) | front cover.
- Page 2 (inside), left to right: portrait | collage | group rate box.

Fold (C-fold): crease at the tick marks (thirds). Fold the RIGHT inside panel (rate box) over the middle first, then fold the LEFT inside panel (portrait) over it. Portrait panel becomes the front cover.

## B. 4-page half-fold booklet (`out/B-booklet.pdf`, 2 pages, landscape)

Print: duplex, landscape, **flip on SHORT edge**.

- Page 1 (outside): left half = back cover (QR + GATHER50), right half = front cover.
- Page 2 (inside): left half = collage + bio, right half = group visits + rate box + coupon.

Fold: crease down the vertical center, front cover on the outside.

## C. Letter sheet with tear-off coupons (`out/C-coupon-sheet.pdf`, 1 page, portrait)

Print: single-sided, portrait. Hand it out whole, or cut along the dashed lines into 6 coupon strips (each has its own working Airbnb QR + GATHER50, 50% off 90m+, expires 10/28).

## Recommendation

Print C first. It is one page, single-sided, works at a table or a front desk, and the tear-off strips put the GATHER50 code (expires 10/28) into people's hands. A and B need duplex alignment and only pay off once the group rate is filled in.

## Copy sources

Reused from flyer v4: headline, "In-Home Massage Therapy", "Mobile Relaxation Service", LA-area line, GATHER50 line, 14-years line, footer. New (review it): "Group & Office Visits", the pitch sentence, the 3 steps, "Book with the Airbnb listing", "Coupon on the table".

Assets in `assets/` are copied from the v4 build (`hero.png`, `portrait.jpg`, `panel-*.png`, `qr-airbnb.svg`).
