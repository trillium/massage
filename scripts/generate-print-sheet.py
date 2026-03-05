#!/usr/bin/env python3
"""
generate-print-sheet.py

6-up print sheet for duplex handbills.

Orientation:
  LEFT  column — rotated 90°  (head faces CENTER, feet/white margin face LEFT edge)
  RIGHT column — rotated 270° (head faces CENTER, feet/white margin face RIGHT edge)

Duplex (long-edge flip = flip left↔right):
  Front left col (90°)  → Back right col (270°)
  Front right col (270°) → Back left col  (90°)

URL printed rotated in the white-margin strip of each front card.

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
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT   = Path(__file__).parent.parent
QR_DIR      = REPO_ROOT / "print" / "qr"
OUT_PATH    = REPO_ROOT / "print" / "sheet.pdf"
DEFAULT_PDF = Path.home() / "Downloads" / "CC BEV (2).pdf"

# Green square: where the QR code goes on page 1 (top-left origin, pts)
GREEN = fitz.Rect(343, 402, 579, 637.5)

# Sheet — US Letter portrait
PAGE_W, PAGE_H = 612, 792
COLS, ROWS     = 2, 3
GUTTER         = 24           # pts between the two heads (~0.33 in)
CELL_W = (PAGE_W - GUTTER) / COLS   # 294
CELL_H = PAGE_H / ROWS               # 264

# Col x-origins (left col starts at 0, right col starts after gutter)
COL_X = {0: 0, 1: CELL_W + GUTTER}

# Source card is 612×792 portrait.  Rotated 90/270 it becomes 792×612 landscape.
# Scale to fit cell (294×264):  min(294/792, 264/612) = 0.3712
SCALE  = min(CELL_W / PAGE_H, CELL_H / PAGE_W)
CARD_W = PAGE_H * SCALE   # fills cell width
CARD_H = PAGE_W * SCALE
Y_PAD  = (CELL_H - CARD_H) / 2

# White margin at feet of source card: 70 pts scaled to cell width
WHITE_MARGIN_PTS = 70
WHITE_STRIP      = WHITE_MARGIN_PTS * SCALE

# Column rotations
COL_ROTATE = {0: 270, 1: 90}

# For duplex (long-edge flip = swap columns + swap rotations)
BACK_COL    = {0: 1,  1: 0}
BACK_ROTATE = {0: 90, 1: 270}


def cell_rect(col: int, row: int) -> fitz.Rect:
    x0 = COL_X[col]
    y0 = row * CELL_H + Y_PAD
    return fitz.Rect(x0, y0, x0 + CARD_W, y0 + CARD_H)


def make_front(template: fitz.Document, qr_path: Path) -> fitz.Document:
    """Copy template page 0, overlay QR SVG (as vector PDF) over the green square."""
    doc = fitz.open()
    doc.insert_pdf(template, from_page=0, to_page=0)
    svg_doc = fitz.open("svg", qr_path.read_bytes())
    qr_pdf  = fitz.open("pdf", svg_doc.convert_to_pdf())
    doc[0].show_pdf_page(GREEN, qr_pdf, 0, keep_proportion=False)
    return doc


def draw_url(page: fitz.Page, col: int, row: int, url: str) -> None:
    """
    Print the URL rotated in the white-margin strip.
    Left col:  strip at left edge, text reads bottom→top  (rotate=90)
    Right col: strip at right edge, text reads top→bottom (rotate=270)
    """
    fontsize   = 6.5
    text_color = (0.45, 0.45, 0.45)
    cell_y0    = row * CELL_H

    # Vertical center of the card content (excluding Y_PAD)
    y_center = cell_y0 + CELL_H / 2

    if col == 0:
        # Left col: white margin (feet) is at the LEFT edge of the cell
        x = COL_X[0] + WHITE_STRIP / 2
        page.insert_text(fitz.Point(x, y_center), url,
                         fontsize=fontsize, color=text_color, rotate=90)
    else:
        # Right col: white margin (feet) is at the RIGHT edge of the cell
        x = COL_X[1] + CARD_W - WHITE_STRIP / 2
        page.insert_text(fitz.Point(x, y_center), url,
                         fontsize=fontsize, color=text_color, rotate=270)


def draw_cut_lines(page: fitz.Page) -> None:
    shape = page.new_shape()
    # Gutter edges (two lines around the center gap)
    shape.draw_line(fitz.Point(CELL_W, 0),          fitz.Point(CELL_W, PAGE_H))
    shape.draw_line(fitz.Point(CELL_W + GUTTER, 0), fitz.Point(CELL_W + GUTTER, PAGE_H))
    # Horizontal row lines
    for r in range(1, ROWS):
        y = r * CELL_H
        shape.draw_line(fitz.Point(0, y), fitz.Point(PAGE_W, y))
    shape.finish(color=(0.7, 0.7, 0.7), width=0.5)
    shape.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", default=str(DEFAULT_PDF))
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        sys.exit(f"PDF not found: {pdf_path}")

    qr_files = sorted(QR_DIR.glob("handbill_*.svg"))
    if not qr_files:
        sys.exit(f"No SVGs in {QR_DIR} — run generate-handbills.ts first")

    template = fitz.open(str(pdf_path))
    if template.page_count < 2:
        sys.exit("PDF needs 2 pages (front + back)")

    out    = fitz.open()
    sheets = 0

    for offset in range(0, len(qr_files), COLS * ROWS):
        batch  = qr_files[offset : offset + COLS * ROWS]
        sheets += 1

        # ── Front ────────────────────────────────────────────────────────────
        front = out.new_page(width=PAGE_W, height=PAGE_H)
        front_docs = [make_front(template, qr) for qr in batch]

        for i, (fdoc, qr_path) in enumerate(zip(front_docs, batch)):
            col, row = i % COLS, i // COLS
            front.show_pdf_page(cell_rect(col, row), fdoc, 0,
                                rotate=COL_ROTATE[col])
            url = f"trilliummassage.la/redirect/{qr_path.stem}"
            draw_url(front, col, row, url)

        draw_cut_lines(front)

        # ── Back (swap cols + swap rotations for long-edge duplex) ────────────
        back = out.new_page(width=PAGE_W, height=PAGE_H)

        for i in range(len(batch)):
            col, row   = i % COLS, i // COLS
            b_col      = BACK_COL[col]
            b_rotate   = BACK_ROTATE[col]
            back.show_pdf_page(cell_rect(b_col, row), template, 1,
                               rotate=b_rotate)

        draw_cut_lines(back)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(OUT_PATH), deflate=True, garbage=4)

    print(f"✓ {len(qr_files)} handbills · {sheets} sheet(s) · {out.page_count} pages")
    print(f"  {OUT_PATH}")
    print()
    print("  Left col: 90°  (head → center)")
    print("  Right col: 270° (head → center)")
    print("  Print duplex, flip on long edge — backs align after cut")


if __name__ == "__main__":
    main()
