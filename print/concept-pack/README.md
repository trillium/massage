# Concept pack: group / office-visit print pieces

Three home-printable concepts (US Letter, 100% scale, no bleed) in the flyer v4 style: same hero, portrait/collage photos (native aspect), and per-flyer tracked QR (scan -> `trilliummassage.la/go/<code>` -> PostHog `ref_link_visit` -> Airbnb). Single practitioner voice: Trillium Smith, LMT, 14 years experience.

## Fill in before printing (placeholders)

The multi-guest reduced rate is NOT decided. Each concept shows a yellow dashed box (edit `RATE_LINES` in `build.py`):

- `Reduced rate per guest: [ $____ ]`
- `Guests per visit: [ ___ to ___ ]`
- `Session length: [ ___ min ]`

## Printing a tracked flyer (af-1, af-2, ...)

Every printed flyer gets its own QR so each one's scans are counted separately. Tag convention: `af-<n>`. The tag is encoded with the existing ref codec (`lib/ref/refCodec.ts`, decodable in `/admin/ref-links`).

1. Pick the next number (af-2 after af-1).
2. Make its QR: `NEXT_PUBLIC_REF_CODE_SECRET=<prod secret> pnpm tsx print/concept-pack/make-qr.mts af-2` - prints the URL and writes `assets/qr-af-2.svg`.
3. Build the PDFs: `python3 print/concept-pack/build.py --ref-tag af-2` (needs `pip3 install pymupdf pillow`) -> `out/af-2/`.
4. Check: `pdftoppm -r 300 -png out/af-2/C-coupon-sheet.pdf /tmp/c && zbarimg /tmp/c-1.png` shows the URL from step 2.
5. In PostHog, event `ref_link_visit`, break down by `ref_decoded` (`af-2`).

Printed so far: `af-1` .. `af-18` are minted for the handbill sheet (`print/sheet-af.pdf`, 3 sheets of 6 cards, one unique QR per card; codes in `print/qr/af-manifest.csv`). `af-1` = `https://trilliummassage.la/go/hOpqX`. The next batch starts at `af-19`.

Handbill sheet: `pnpm tsx print/concept-pack/make-qr.mts af-1 af-18` (writes `print/qr/AF-NN.svg` + manifest), then `python3 scripts/generate-cards/generate-print-sheet.py --prefix=AF- --front print/templates/FRONT_CC_BEV_2.pdf --back print/templates/BACK_GATHER50.pdf --out print/sheet-af.pdf`.

## A. Tri-fold brochure (`out/af-1/A-trifold-brochure.pdf`, 2 pages, landscape)

Print: duplex, landscape, **flip on SHORT edge**.

- Page 1 (outside), left to right: inner flap | back cover (QR + GATHER50) | front cover.
- Page 2 (inside), left to right: portrait | collage | group rate box.

Fold (C-fold): crease at the tick marks (thirds). Fold the RIGHT inside panel (rate box) over the middle first, then fold the LEFT inside panel (portrait) over it. Portrait panel becomes the front cover.

## B. 4-page half-fold booklet (`out/af-1/B-booklet.pdf`, 2 pages, landscape)

Print: duplex, landscape, **flip on SHORT edge**.

- Page 1 (outside): left half = back cover (QR + GATHER50), right half = front cover.
- Page 2 (inside): left half = collage + bio, right half = group visits + rate box + coupon.

Fold: crease down the vertical center, front cover on the outside.

## C. Letter sheet with tear-off coupons (`out/af-1/C-coupon-sheet.pdf`, 1 page, portrait)

Print: single-sided, portrait. Hand it out whole, or cut along the dashed lines into 6 coupon strips (each carries the same tracked QR + GATHER50, 50% off 90m+, expires 10/28).

## Recommendation

Print C first. It is one page, single-sided, works at a table or a front desk, and the tear-off strips put the GATHER50 code (expires 10/28) into people's hands. A and B need duplex alignment and only pay off once the group rate is filled in.

## Copy sources

Reused from flyer v4: headline, "In-Home Massage Therapy", "Mobile Relaxation Service", LA-area line, GATHER50 line, 14-years line, footer. New (review it): "Group & Office Visits", the pitch sentence, the 3 steps, "Book with the Airbnb listing", "Coupon on the table".

Assets in `assets/` are copied from the v4 build (`hero.png`, `portrait.jpg`, `panel-*.png`, `qr-af-<n>.svg` is generated).
