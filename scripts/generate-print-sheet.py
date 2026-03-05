#!/usr/bin/env python3
"""
generate-print-sheet.py

Builds a print-ready 6-up PDF from the handbill design.

For each unique QR code:
  - Places the QR SVG over the green square on page 1 (front)
  - Lays out 6 per sheet, 2 columns × 3 rows (US Letter)
  - Following page = 6 backs (page 2 of source PDF), columns mirrored
    for long-edge duplex — cut any column and front/back align

Usage:
  python3 scripts/generate-print-sheet.py
  python3 scripts/generate-print-sheet.py --pdf ~/Downloads/"CC BEV (2).pdf"

Output: print/sheet.pdf
"""
import argparse
import os
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed. Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
QR_DIR    = REPO_ROOT / "print" / "qr"
OUT_PATH  = REPO_ROOT / "print" / "sheet.pdf"

# Default PDF path
DEFAULT_PDF = Path.home() / "Downloads" / "CC BEV (2).pdf"

# Green square location in PDF coordinates (top-left origin, pts)
# Detected via pixel scan: x=343–579, y=402–637.5
GREEN = fitz.Rect(343, 402, 579, 637.5)

# Sheet layout
PAGE_W, PAGE_H = 612, 792   # US Letter
COLS, ROWS     = 2, 3
CELL_W = PAGE_W / COLS      # 306
CELL_H = PAGE_H / ROWS      # 264

# Scale source page (612×792) to fit cell (306×264), maintain aspect
SCALE    = min(CELL_W / PAGE_W, CELL_H / PAGE_H)   # 0.3333
CARD_W   = PAGE_W * SCALE                           # 204
CARD_H   = PAGE_H * SCALE                           # 264
X_PAD    = (CELL_W - CARD_W) / 2                    # 51 — center in cell


def cell_rect(col: int, row: int) -> fitz.Rect:
    """Return the Rect for placing a card in this cell."""
    x0 = col * CELL_W + X_PAD
    y0 = row * CELL_H
    return fitz.Rect(x0, y0, x0 + CARD_W, y0 + CARD_H)


def make_front(template: fitz.Document, qr_path: Path) -> fitz.Document:
    """Copy template page 0 and overlay QR code (as vector PDF) over the green square."""
    doc = fitz.open()
    doc.insert_pdf(template, from_page=0, to_page=0)
    page = doc[0]

    # Convert SVG → PDF to keep vector quality and small file size
    svg_doc = fitz.open("svg", qr_path.read_bytes())
    qr_pdf = fitz.open("pdf", svg_doc.convert_to_pdf())

    page.show_pdf_page(GREEN, qr_pdf, 0, keep_proportion=False)
    return doc


def draw_cut_lines(page: fitz.Page) -> None:
    shape = page.new_shape()
    gray = (0.7, 0.7, 0.7)
    # Vertical
    for c in range(1, COLS):
        x = c * CELL_W
        shape.draw_line(fitz.Point(x, 0), fitz.Point(x, PAGE_H))
    # Horizontal
    for r in range(1, ROWS):
        y = r * CELL_H
        shape.draw_line(fitz.Point(0, y), fitz.Point(PAGE_W, y))
    shape.finish(color=gray, width=0.5)
    shape.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", default=str(DEFAULT_PDF),
                        help="Path to source handbill PDF (front=page1, back=page2)")
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        sys.exit(f"PDF not found: {pdf_path}")

    qr_files = sorted(QR_DIR.glob("handbill_*.svg"))
    if not qr_files:
        sys.exit(f"No handbill SVGs in {QR_DIR} — run generate-handbills.ts first")

    template = fitz.open(str(pdf_path))
    if template.page_count < 2:
        sys.exit("PDF must have 2 pages (front + back)")

    out = fitz.open()
    batch_size = COLS * ROWS  # 6

    sheets = 0
    for offset in range(0, len(qr_files), batch_size):
        batch = qr_files[offset:offset + batch_size]
        sheets += 1

        # ── Front sheet ──────────────────────────────────────────────────────
        front_page = out.new_page(width=PAGE_W, height=PAGE_H)

        front_docs = [make_front(template, qr) for qr in batch]
        for i, fdoc in enumerate(front_docs):
            col, row = i % COLS, i // COLS
            front_page.show_pdf_page(cell_rect(col, row), fdoc, 0)

        draw_cut_lines(front_page)

        # ── Back sheet (columns mirrored for long-edge duplex) ────────────────
        back_page = out.new_page(width=PAGE_W, height=PAGE_H)

        for i in range(len(batch)):
            col, row = i % COLS, i // COLS
            mirrored_col = (COLS - 1) - col          # swap L/R
            back_page.show_pdf_page(cell_rect(mirrored_col, row), template, 1)

        draw_cut_lines(back_page)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(OUT_PATH), deflate=True, garbage=4)

    print(f"✓ {len(qr_files)} handbills · {sheets} sheet(s) · {out.page_count} pages")
    print(f"  {OUT_PATH}")
    print()
    print("  Print: duplex, flip on long edge, 100% / actual size")
    print("  Cut along dashed lines — front/back align on every column")


if __name__ == "__main__":
    main()
