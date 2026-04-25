# Print Handbills Pipeline

Two-step pipeline: generate unique QR SVGs, then stamp them onto a template PDF.

## Prerequisites

- Node/pnpm (for QR generation)
- Python 3 + pymupdf (`pip3 install pymupdf`)
- Template PDFs in `print/templates/` (see Template PDFs section below)

## Step 1: Generate QR SVGs

```bash
pnpm tsx scripts/generate-handbills.ts --prefix=HB- --count=6
```

This:
1. Creates random slugs (e.g. `HB-A6D8DB95`)
2. Records redirect entries in `redirects.jsonl` (slug -> destination URL)
3. Renders each QR as an SVG in `print/qr/` using the native eyelet renderer

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--prefix=` | `HB-` | Filename/slug prefix |
| `--count=` | `6` | Number of QR codes to generate |
| `--dest=` | airbnb promo blog post | Destination URL the QR points to |
| `--regen` | off | Regenerate SVGs for existing redirects with missing files |

### Examples

```bash
# 6 codes with default prefix, pointing to airbnb promo
pnpm tsx scripts/generate-handbills.ts

# 10 codes with custom prefix and destination
pnpm tsx scripts/generate-handbills.ts --prefix=HB2- --count=10 --dest=/quicklinks

# Regenerate missing SVGs only (no new slugs)
pnpm tsx scripts/generate-handbills.ts --prefix=HB- --count=0 --regen
```

Output: `print/qr/{PREFIX}*.svg`

Safe to re-run — skips slugs/files that already exist.

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

| Flag | Default | Description |
|------|---------|-------------|
| `--front` | — | Single-page front template PDF (must pair with `--back`) |
| `--back` | — | Single-page back template PDF (must pair with `--front`) |
| `--pdf` | `print/templates/CC BEV (2).pdf` | 2-page template PDF (ignored if `--front`/`--back` given) |
| `--prefix` | `handbill_` | SVG filename prefix to match in `print/qr/` |
| `--out` | `print/sheet.pdf` | Output path |

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
  generate-handbills.ts          Step 1: QR generation
  generate-cards/
    generate-print-sheet.py      Step 2: PDF composition
  validate-print-qr.py          Step 3: QR validation
  extract-qr-template.ts        Utility: extract eyelet template from QR Monkey SVG
redirects.jsonl                  Source of truth for all slug -> URL mappings
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
