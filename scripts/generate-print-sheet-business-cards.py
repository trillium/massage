#!/usr/bin/env python3
"""
generate-print-sheet-business-cards.py

10-up print sheet for duplex business cards (2 cols × 5 rows).

Business card dimensions: 1050×600 px (3.5×2 in @ 300 DPI)
Green square: 327×327 at position +664+176

Duplex (short-edge flip = flip top↔bottom):
  Front row N → Back row (5-N-1)

URL printed in gutter below each card on the front page.

Usage:
  python3 scripts/generate-print-sheet-business-cards.py
  python3 scripts/generate-print-sheet-business-cards.py --template ~/path/to/template.png

Output: print/business-cards/sheet.pdf
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
QR_DIR = REPO_ROOT / "print" / "qr"
REDIRECTS_PATH = REPO_ROOT / "redirects.jsonl"
DEFAULT_TEMPLATE = REPO_ROOT / "print" / "business-cards" / "template.png"

# Business card dimensions in pixels (300 DPI): 3.5" × 2" = 1050 × 600 px
CARD_W_PX, CARD_H_PX = 1050, 600

# Convert to points (1 inch = 72 pt, 300 DPI = 300 px/inch → 72/300 = 0.24 pt/px)
PX_TO_PT = 72 / 300
CARD_W_PT = CARD_W_PX * PX_TO_PT  # 252 pt
CARD_H_PT = CARD_H_PX * PX_TO_PT  # 144 pt

# Green square position in pixels (from tile-cards.sh)
GREEN_PX = {"x": 664, "y": 176, "size": 327}
# Convert to points for PyMuPDF
GREEN = fitz.Rect(
    GREEN_PX["x"] * PX_TO_PT,
    GREEN_PX["y"] * PX_TO_PT,
    (GREEN_PX["x"] + GREEN_PX["size"]) * PX_TO_PT,
    (GREEN_PX["y"] + GREEN_PX["size"]) * PX_TO_PT,
)

# QR frame: teal outer + inner border, 2 pt each with 2 pt gap between
TEAL = (45 / 255, 212 / 255, 191 / 255)  # #2dd4bf
BORDER_W = 1.5  # pt — both outer and inner stroke width
BORDER_GAP = 1.5  # pt — gap between outer and inner border
QR_INSET = 0  # No inset - QR fills the entire green square
QR_RECT = fitz.Rect(
    GREEN.x0 + QR_INSET,
    GREEN.y0 + QR_INSET,
    GREEN.x1 - QR_INSET,
    GREEN.y1 - QR_INSET,
)

# Sheet — US Letter portrait
PAGE_W, PAGE_H = 612, 792
COLS, ROWS = 2, 5
MARGIN_X = 18  # ~0.25 in left/right margin
MARGIN_Y = 18  # ~0.25 in top/bottom margin

# Calculate available space and gaps
AVAIL_W = PAGE_W - 2 * MARGIN_X
AVAIL_H = PAGE_H - 2 * MARGIN_Y
COL_GAP = (AVAIL_W - 2 * CARD_W_PT) / 1  # gap between columns
ROW_GAP = (AVAIL_H - 5 * CARD_H_PT) / 4  # gap between rows

# Column x-origins
COL_X = [MARGIN_X, MARGIN_X + CARD_W_PT + COL_GAP]

# URL label settings
GUTTER_H = 12  # height of gutter below each card for URL


def cell_rect(col: int, row: int) -> fitz.Rect:
    """Return the rect for card at (col, row) — no rotation."""
    x0 = COL_X[col]
    y0 = MARGIN_Y + row * (CARD_H_PT + ROW_GAP)
    return fitz.Rect(x0, y0, x0 + CARD_W_PT, y0 + CARD_H_PT)


def make_front(template_path: Path, qr_path: Path) -> fitz.Document:
    """Load template PNG, overlay QR SVG with teal double-border over the green square."""
    # Load PNG template as a single-page PDF
    template_doc = fitz.open(str(template_path))

    # Create output doc and get the template page
    doc = fitz.open()

    # Insert template as a PDF page (PyMuPDF auto-converts PNG to PDF internally)
    page = doc.new_page(width=CARD_W_PT, height=CARD_H_PT)

    # Show the template image at full page size
    page.insert_image(page.rect, filename=str(template_path), keep_proportion=False)

    # 1. Flood-fill the placeholder with teal
    page.draw_rect(GREEN, color=TEAL, fill=TEAL, width=0)

    # 2. Place QR image inset inside the frame area
    svg_doc = fitz.open("svg", qr_path.read_bytes())
    qr_pdf = fitz.open("pdf", svg_doc.convert_to_pdf())
    page.show_pdf_page(QR_RECT, qr_pdf, 0, keep_proportion=False)

    # 3. Outer border: teal stroke around the full placeholder
    page.draw_rect(GREEN, color=TEAL, fill=None, width=BORDER_W)
    # 4. Inner border: teal stroke around the QR image
    page.draw_rect(QR_RECT, color=TEAL, fill=None, width=BORDER_W)

    return doc


def draw_url(page: fitz.Page, col: int, row: int, url: str) -> None:
    """Print the URL centered below the card in the gutter."""
    fontsize = 7
    text_color = (0.45, 0.45, 0.45)

    cell = cell_rect(col, row)
    # Center horizontally in the card, place below the card
    text_len = fitz.get_text_length(url, fontsize=fontsize)
    x = cell.x0 + CARD_W_PT / 2 - text_len / 2
    y = cell.y1 + GUTTER_H / 2 + fontsize / 2  # vertically center in gutter

    page.insert_text(fitz.Point(x, y), url, fontsize=fontsize, color=text_color)


def draw_cut_lines(page: fitz.Page) -> None:
    """Draw dashed cut lines around the card grid."""
    shape = page.new_shape()

    # Vertical lines (column edges)
    for x in [COL_X[0], COL_X[0] + CARD_W_PT, COL_X[1], COL_X[1] + CARD_W_PT]:
        y_start = MARGIN_Y
        y_end = MARGIN_Y + ROWS * CARD_H_PT + (ROWS - 1) * ROW_GAP
        shape.draw_line(fitz.Point(x, y_start), fitz.Point(x, y_end))

    # Horizontal lines (row edges)
    for r in range(ROWS + 1):
        y = MARGIN_Y + r * (CARD_H_PT + ROW_GAP)
        shape.draw_line(fitz.Point(COL_X[0], y), fitz.Point(COL_X[1] + CARD_W_PT, y))

    shape.finish(color=(0.7, 0.7, 0.7), width=0.5, dashes="[3 2] 0")
    shape.commit()


def get_scope_from_redirects(qr_files):
    """Extract scope from the destination URL of the first QR code."""
    if not REDIRECTS_PATH.exists():
        return "default"

    # Get the slug from the first QR file
    first_slug = qr_files[0].stem

    # Find the redirect entry for this slug
    with open(REDIRECTS_PATH) as f:
        for line in f:
            if not line.strip():
                continue
            entry = json.loads(line)
            if entry["source"].endswith(first_slug):
                # Extract scope from destination URL
                dest = entry["destination"]
                # Examples:
                #   https://trilliummassage.la/blog/airbnb-host-promo-2026-03 → airbnb-host-promo-2026-03
                #   https://trilliummassage.la → trilliummassage
                if "/blog/" in dest:
                    scope = dest.split("/blog/")[-1].rstrip("/")
                else:
                    # Use the domain name
                    scope = (
                        dest.replace("https://", "")
                        .replace("http://", "")
                        .split("/")[0]
                        .split(".")[0]
                    )
                return scope

    return "default"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", default=str(DEFAULT_TEMPLATE))
    parser.add_argument(
        "--scope", help="Scope name for output filename (auto-detected if not provided)"
    )
    args = parser.parse_args()

    template_path = Path(args.template)
    if not template_path.exists():
        sys.exit(f"Template not found: {template_path}")

    qr_files = sorted(QR_DIR.glob("BC-*.svg"))
    if not qr_files:
        qr_files = sorted(QR_DIR.glob("businessCard_*.svg"))
    if not qr_files:
        sys.exit(f"No BC-*.svg or businessCard_*.svg in {QR_DIR} — run generate-handbills.ts first")

    # Determine scope for filename
    scope = args.scope if args.scope else get_scope_from_redirects(qr_files)
    out_path = REPO_ROOT / "print" / "business-cards" / f"{scope}_sheet.pdf"

    out = fitz.open()
    sheets = 0

    for offset in range(0, len(qr_files), COLS * ROWS):
        batch = qr_files[offset : offset + COLS * ROWS]
        sheets += 1

        # ── Front ────────────────────────────────────────────────────────────
        front = out.new_page(width=PAGE_W, height=PAGE_H)
        front_docs = [make_front(template_path, qr) for qr in batch]

        for i, (fdoc, qr_path) in enumerate(zip(front_docs, batch)):
            col, row = i % COLS, i // COLS
            front.show_pdf_page(cell_rect(col, row), fdoc, 0)
            url = f"trilliummassage.la/redirect/{qr_path.stem}"
            draw_url(front, col, row, url)

        draw_cut_lines(front)

        # ── Back (short-edge duplex = flip rows top↔bottom) ──────────────────
        back = out.new_page(width=PAGE_W, height=PAGE_H)

        # Load back template as image
        back_template = REPO_ROOT / "print" / "business-cards" / "template-back.png"

        for i in range(len(batch)):
            col, row = i % COLS, i // COLS
            # For short-edge duplex, flip row order: row 0 → row 4, row 1 → row 3, etc.
            back_row = ROWS - row - 1

            # Create a temp page with the back template
            back_page_doc = fitz.open()
            temp_page = back_page_doc.new_page(width=CARD_W_PT, height=CARD_H_PT)
            temp_page.insert_image(
                temp_page.rect, filename=str(back_template), keep_proportion=False
            )

            # Place on back sheet
            back.show_pdf_page(cell_rect(col, back_row), back_page_doc, 0)

        draw_cut_lines(back)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(out_path), deflate=True, garbage=4)

    print(
        f"✓ {len(qr_files)} business cards · {sheets} sheet(s) · {out.page_count} pages"
    )
    print(f"  {out_path}")
    print()
    print("  2×5 grid (10 cards per sheet)")
    print("  Print duplex, flip on short edge — backs align after cut")

    # Post-generation QR validation
    import subprocess

    print("\n── Validating QR renders ──\n")
    result = subprocess.run(
        [
            sys.executable,
            str(Path(__file__).parent / "validate-print-qr.py"),
            "--sheet",
            str(out_path),
            "--save-crops",
        ],
    )
    if result.returncode:
        print("\n⚠ QR validation failed — check print/qc/ for failed crops")
        sys.exit(1)


if __name__ == "__main__":
    main()
