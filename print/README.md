# Print Handbills Pipeline

Two-step pipeline: generate unique QR SVGs, then stamp them onto a template PDF.

## Prerequisites

- Node/pnpm (for QR generation)
- Python 3 + pymupdf (`pip3 install pymupdf`)
- Template PDFs in `print/templates/` (see Template PDFs section below)

## Step 1: Generate QR SVGs

The `/rd/<SCOPE>-<HEX8>` scheme is the only supported QR scheme. Every code in a scope resolves
to one destination registered in `lib/qr/scope-defaults.ts`; no rebuild is needed for new codes.

```bash
pnpm tsx scripts/generate-pdf-card.ts --prefix=BC07- --count=50
pnpm tsx scripts/generate-pdf-handbill.ts --prefix=HB01- --count=6
pnpm tsx scripts/generate-pdf-print.ts --prefix=<SCOPE>- --count=<n> --dest=<url>
```

This:

1. Creates random slugs (e.g. `HB01-A6D8DB95`)
2. Renders each QR as an SVG in `print/qr/` (encodes `https://trilliummassage.la/rd/<slug>`)
3. Verifies the batch and writes `print/qr/_qr_verification_<SCOPE>.json`

Options: `--prefix=` (required, `{LETTERS}{DIGITS}-`), `--count=`, `--dest=` (only checked
against the registry; the registered default wins), `--regen`.

### Registered scopes

| Scope         | Destination                                 |
| ------------- | ------------------------------------------- |
| `BC01`-`BC06` | home                                        |
| `BCR01`       | `/overtime`                                 |
| `AFSR01`      | `/edge-office-hours`                        |
| `HB01`        | `/blog/airbnb-host-promo-2026-03`           |
| `HB2`         | `/nerdstage` (matches legacy `HB2-*` cards) |

New campaign: add the scope to `SCOPE_DEFAULTS` and deploy _before_ printing; unregistered scopes 404.

### Legacy `/redirect` scheme (frozen)

`scripts/generate-handbills.ts` and `redirects.jsonl` are deprecated. Already-printed cards
(`businessCard_*`, `handbill_*`, `handbiz_*`, `screen_*`, `BC-*`, `HB2-*`, `OT-*`, `lockscreen01`)
still resolve through `redirects.jsonl`, so **never delete those rules**. Do not append new ones:
`lib/qr/__tests__/legacy-redirects-frozen.test.ts` fails on any new `/redirect` source. Legacy
prefixes without digits (`BC-`, `OT-`) cannot be scopes and stay legacy-only.
`generate-screen-qr.ts` was removed (it called a missing script).

## Step 2: Stamp QRs onto template PDF

The script accepts templates in two modes: **separate front/back PDFs** (preferred) or a combined 2-page PDF.

### Separate front + back (preferred)

```bash
python3 scripts/generate-cards/generate-print-sheet.py --prefix=HB2- \
  --front print/templates/FRONT_CC_BEV_2.pdf \
  --back print/templates/BACK_Handbill_Business_Card.pdf
```

This lets you mix and match fronts and backs independently.

### Combined 2-page PDF (legacy)

```bash
python3 scripts/generate-cards/generate-print-sheet.py --prefix=HB- \
  --pdf print/templates/"CC BEV (2).pdf"
```

Page 1 = front, page 2 = back.

### What it does

1. Finds each `{prefix}*.svg` in `print/qr/`
2. On the front template, replaces the **green square** (hardcoded rect at `343, 402, 579, 637.5` pts) with:
   - Teal flood fill (`#2dd4bf`)
   - QR SVG inset 6pts (double teal border: 2pt outer + 2pt gap + 2pt inner)
3. Tiles 6-up on US Letter (2 cols x 3 rows, 24pt center gutter)
   - Left column rotated 270deg, right column rotated 90deg (heads face center)
   - Back page swaps columns for long-edge duplex alignment
4. Prints the redirect URL in each card's white margin strip
5. Adds cut lines
6. Runs `validate-print-qr.py` to verify every QR rendered correctly

### Options

| Flag       | Default                          | Description                                               |
| ---------- | -------------------------------- | --------------------------------------------------------- |
| `--front`  | —                                | Single-page front template PDF (must pair with `--back`)  |
| `--back`   | —                                | Single-page back template PDF (must pair with `--front`)  |
| `--pdf`    | `print/templates/CC BEV (2).pdf` | 2-page template PDF (ignored if `--front`/`--back` given) |
| `--prefix` | `handbill_`                      | SVG filename prefix to match in `print/qr/`               |
| `--out`    | `print/sheet.pdf`                | Output path                                               |

Output: `print/sheet.pdf` (front/back pages, ready for duplex printing)

## Step 3: Validate (automatic)

The print sheet script auto-runs validation, but you can also run it standalone:

```bash
python3 scripts/validate-print-qr.py --save-crops
```

Checks:

- Each QR region is not solid (SVG modules actually rendered)
- Every QR crop is unique (no duplicate renders)

Failed crops saved to `print/qc/` for inspection.

## File Layout

```
print/
  templates/       Front and back template PDFs
  qr/              SVG QR codes (one per unique slug)
  qc/              QR validation crops (debug output)
  sheet.pdf        Final print-ready output
scripts/
  generate-pdf-print.ts          Step 1: QR generation (/rd scheme; card/handbill wrappers)
  generate-handbills.ts          DEPRECATED legacy /redirect generator
  generate-cards/
    generate-print-sheet.py      Step 2: PDF composition
  validate-print-qr.py          Step 3: QR validation
  extract-qr-template.ts        Utility: extract eyelet template from QR Monkey SVG
redirects.jsonl                  FROZEN legacy /redirect rules (printed cards only)
lib/qr/scope-defaults.ts         Source of truth for /rd scope -> URL
```

## Template PDFs

Templates live in `print/templates/`. Naming convention:

- `FRONT_*.pdf` — front templates (must contain a green square placeholder)
- `BACK_*.pdf` — back templates (used as-is, no modifications)
- Combined 2-page PDFs are also supported (legacy)

### Front template requirements

- Single page, US Letter (612 x 792 pts)
- Must have a **green square** at rect `(343, 402, 579, 637.5)` pts
- The green square gets fully replaced with the QR code + teal border frame

### Back template requirements

- Single page, US Letter (612 x 792 pts)
- Used as-is — no placeholders needed
