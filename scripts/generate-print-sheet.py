#!/usr/bin/env python3
"""
generate-print-sheet.py

Builds a print-ready 6-up PDF from the handbill design.

Layout (US Letter, 2 cols × 3 rows):
  - Row 0: rotated 180° — white margin (bottom) points toward TOP edge
  - Rows 1–2: normal — white margin points toward BOTTOM edge
  - URL printed in the white margin strip of each front card
  - Back page: same rotation, columns mirrored for long-edge duplex

Usage:
  python3 scripts/generate-print-sheet.py
  python3 scripts/generate-print-sheet.py --pdf ~/Downloads/"CC BEV (2).pdf"

Output: print/sheet.pdf
"""
import argparse
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed. Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
QR_DIR    = REPO_ROOT / "print" / "qr"
OUT_PATH  = REPO_ROOT / "print" / "sheet.pdf"

DEFAULT_PDF = Path.home() / "Downloads" / "CC BEV (2).pdf"

# Green square in PDF coords (top-left origin, pts)
GREEN = fitz.Rect(343, 402, 579, 637.5)

# Source page / sheet dimensions
PAGE_W, PAGE_H = 612, 792   # US Letter (matches source PDF)
COLS, ROWS     = 2, 3
CELL_W = PAGE_W / COLS      # 306
CELL_H = PAGE_H / ROWS      # 264

# Scale source page to fit cell, maintaining aspect ratio
SCALE  = min(CELL_W / PAGE_W, CELL_H / PAGE_H)   # 0.3333
CARD_W = PAGE_W * SCALE                           # 204
CARD_H = PAGE_H * SCALE                           # 264
X_PAD  = (CELL_W - CARD_W) / 2                   # 51 — center horizontally

# White margin at bottom of source page (measured: 70 pts → 23.3 pts scaled)
WHITE_BOTTOM = 70 * SCALE   # ≈ 23 pts — URL strip lives here

# Row 0 is rotated — rows 1+ are normal
def is_rotated(row: int) -> bool:
    return row == 0


def card_rect(col: int, row: int) -> fitz.Rect:
    """Rect for placing a card on the sheet (same for rotated and normal)."""
    x0 = col * CELL_W + X_PAD
    y0 = row * CELL_H
    return fitz.Rect(x0, y0, x0 + CARD_W, y0 + CARD_H)


def url_text_point(col: int, row: int) -> tuple[float, float]:
    """
    Center point for URL text within the card's white margin strip.
    Rotated row 0: margin is now at top of cell.
    Normal rows: margin is at bottom of cell.
    """
    x_center = col * CELL_W + CELL_W / 2
    cell_top  = row * CELL_H
    if is_rotated(row):
        # White margin landed at top after 180° rotation
        y = cell_top + WHITE_BOTTOM / 2
    else:
        # White margin is at bottom of card
        y = cell_top + CARD_H - WHITE_BOTTOM / 2
    return x_center, y


def make_front(template: fitz.Document, qr_path: Path) -> fitz.Document:
    """Copy template page 0 and overlay QR code (vector) over the green square."""
    doc = fitz.open()
    doc.insert_pdf(template, from_page=0, to_page=0)
    page = doc[0]

    svg_doc = fitz.open("svg", qr_path.read_bytes())
    qr_pdf  = fitz.open("pdf", svg_doc.convert_to_pdf())
    page.show_pdf_page(GREEN, qr_pdf, 0, keep_proportion=False)
    return doc


def slug_from_path(qr_path: Path) -> str:
    return qr_path.stem   # e.g. "handbill_fbad6739"


def redirect_url(slug: str) -> str:
    return f"trilliummassage.la/redirect/{slug}"


def draw_cut_lines(page: fitz.Page) -> None:
    shape = page.new_shape()
    for c in range(1, COLS):
        shape.draw_line(fitz.Point(c * CELL_W, 0), fitz.Point(c * CELL_W, PAGE_H))
    for r in range(1, ROWS):
        shape.draw_line(fitz.Point(0, r * CELL_H), fitz.Point(PAGE_W, r * CELL_H))
    shape.finish(color=(0.7, 0.7, 0.7), width=0.5)
    shape.commit()


def draw_url(page: fitz.Page, col: int, row: int, url: str) -> None:
    x, y = url_text_point(col, row)
    fontsize = 6.5
    # insert_text anchors at baseline; measure text width to center manually
    text_w = fitz.get_text_length(url, fontsize=fontsize)
    page.insert_text(
        fitz.Point(x - text_w / 2, y + fontsize / 2),
        url,
        fontsize=fontsize,
        color=(0.4, 0.4, 0.4),
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", default=str(DEFAULT_PDF))
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        sys.exit(f"PDF not found: {pdf_path}")

    qr_files = sorted(QR_DIR.glob("handbill_*.svg"))
    if not qr_files:
        sys.exit(f"No handbill SVGs in {QR_DIR} — run generate-handbills.ts first")

    template = fitz.open(str(pdf_path))
    if template.page_count < 2:
        sys.exit("PDF needs 2 pages (front + back)")

    out = fitz.open()

    sheets = 0
    for offset in range(0, len(qr_files), COLS * ROWS):
        batch  = qr_files[offset : offset + COLS * ROWS]
        sheets += 1

        # ── Front ────────────────────────────────────────────────────────────
        front = out.new_page(width=PAGE_W, height=PAGE_H)
        front_docs = [make_front(template, qr) for qr in batch]

        for i, (fdoc, qr_path) in enumerate(zip(front_docs, batch)):
            col, row = i % COLS, i // COLS
            rotate = 180 if is_rotated(row) else 0
            front.show_pdf_page(card_rect(col, row), fdoc, 0, rotate=rotate)
            draw_url(front, col, row, redirect_url(slug_from_path(qr_path)))

        draw_cut_lines(front)

        # ── Back (columns mirrored, same rotation) ────────────────────────────
        back = out.new_page(width=PAGE_W, height=PAGE_H)

        for i in range(len(batch)):
            col, row = i % COLS, i // COLS
            mirrored_col = (COLS - 1) - col
            rotate = 180 if is_rotated(row) else 0
            back.show_pdf_page(card_rect(mirrored_col, row), template, 1, rotate=rotate)

        draw_cut_lines(back)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(OUT_PATH), deflate=True, garbage=4)

    print(f"✓ {len(qr_files)} handbills · {sheets} sheet(s) · {out.page_count} pages")
    print(f"  {OUT_PATH}")
    print()
    print("  Print: duplex, flip on long edge, 100% / actual size")
    print("  Row 0 rotated 180° — white margins face outward on all rows")
    print("  URL printed in white margin of each front card")


if __name__ == "__main__":
    main()
