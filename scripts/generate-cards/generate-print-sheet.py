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
  python3 scripts/generate-cards/generate-print-sheet.py
  python3 scripts/generate-cards/generate-print-sheet.py --pdf print/templates/"CC BEV (2).pdf"
  python3 scripts/generate-cards/generate-print-sheet.py --front front.pdf --back back.pdf

Output: print/sheet.pdf
"""
import argparse
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT   = Path(__file__).parent.parent.parent
QR_DIR      = REPO_ROOT / "print" / "qr"
DEFAULT_OUT = REPO_ROOT / "print" / "sheet.pdf"
DEFAULT_PDF = REPO_ROOT / "print" / "templates" / "CC BEV (2).pdf"

# Green square: where the QR code goes on page 1 (top-left origin, pts)
GREEN = fitz.Rect(343, 402, 579, 637.5)

# QR frame: teal outer + inner border, 2 pt each with 2 pt gap between
TEAL        = (45/255, 212/255, 191/255)   # #2dd4bf
BORDER_W    = 2    # pt — both outer and inner stroke width
BORDER_GAP  = 2    # pt — gap between outer and inner border
QR_INSET    = BORDER_W + BORDER_GAP + BORDER_W   # 6 pt total inset for QR image
QR_RECT     = fitz.Rect(
    GREEN.x0 + QR_INSET, GREEN.y0 + QR_INSET,
    GREEN.x1 - QR_INSET, GREEN.y1 - QR_INSET,
)

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


def make_front(front_doc: fitz.Document, qr_path: Path) -> fitz.Document:
    """Copy front template, overlay QR SVG with teal double-border over the green square."""
    doc = fitz.open()
    doc.insert_pdf(front_doc, from_page=0, to_page=0)
    page = doc[0]

    # 1. Flood-fill the placeholder with teal — kills any green bleed at the edges
    page.draw_rect(GREEN, color=TEAL, fill=TEAL, width=0)

    # 2. Place QR image inset inside the frame area
    svg_doc = fitz.open("svg", qr_path.read_bytes())
    qr_pdf  = fitz.open("pdf", svg_doc.convert_to_pdf())
    page.show_pdf_page(QR_RECT, qr_pdf, 0, keep_proportion=False)

    # 3. Outer border: teal stroke around the full placeholder
    page.draw_rect(GREEN,   color=TEAL, fill=None, width=BORDER_W)
    # 4. Inner border: teal stroke around the QR image
    page.draw_rect(QR_RECT, color=TEAL, fill=None, width=BORDER_W)

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

    # Center text along the card height.
    # insert_text anchors at the START of the baseline, so offset by half the
    # text length so the string is truly centered in the card.
    text_len = fitz.get_text_length(url, fontsize=fontsize)
    card_v_center = cell_y0 + Y_PAD + CARD_H / 2

    # x: 4 pts inside the content edge (closer to image, not buried in margin)
    if col == 0:
        # Left col: white strip on LEFT; content starts at x ≈ WHITE_STRIP
        x = COL_X[0] + WHITE_STRIP - 4
        # rotate=90 → text goes upward from anchor, so shift anchor down by half
        page.insert_text(fitz.Point(x, card_v_center + text_len / 2), url,
                         fontsize=fontsize, color=text_color, rotate=90)
    else:
        # Right col: white strip on RIGHT; content ends at x ≈ COL_X[1] + CARD_W - WHITE_STRIP
        x = COL_X[1] + CARD_W - WHITE_STRIP + 4
        # rotate=270 → text goes downward from anchor, so shift anchor up by half
        page.insert_text(fitz.Point(x, card_v_center - text_len / 2), url,
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
    parser.add_argument("--pdf", default=None,
                        help="2-page PDF (front + back). Ignored if --front/--back given.")
    parser.add_argument("--front", default=None,
                        help="Single-page front template PDF")
    parser.add_argument("--back", default=None,
                        help="Single-page back template PDF")
    parser.add_argument("--prefix", default="handbill_",
                        help="SVG filename prefix to match (default: handbill_)")
    parser.add_argument("--out", default=None,
                        help="Output PDF path (default: print/sheet.pdf)")
    args = parser.parse_args()

    if args.front or args.back:
        if not args.front or not args.back:
            sys.exit("--front and --back must both be provided")
        front_path, back_path = Path(args.front), Path(args.back)
        if not front_path.exists():
            sys.exit(f"Front PDF not found: {front_path}")
        if not back_path.exists():
            sys.exit(f"Back PDF not found: {back_path}")
        front_doc = fitz.open(str(front_path))
        back_doc = fitz.open(str(back_path))
    else:
        pdf_path = Path(args.pdf) if args.pdf else DEFAULT_PDF
        if not pdf_path.exists():
            sys.exit(f"PDF not found: {pdf_path}")
        combined = fitz.open(str(pdf_path))
        if combined.page_count < 2:
            sys.exit("PDF needs 2 pages (front + back)")
        front_doc = fitz.open()
        front_doc.insert_pdf(combined, from_page=0, to_page=0)
        back_doc = fitz.open()
        back_doc.insert_pdf(combined, from_page=1, to_page=1)

    out_path = Path(args.out) if args.out else DEFAULT_OUT

    qr_files = sorted(QR_DIR.glob(f"{args.prefix}*.svg"))
    if not qr_files:
        sys.exit(f"No {args.prefix}*.svg in {QR_DIR}")

    out    = fitz.open()
    sheets = 0

    for offset in range(0, len(qr_files), COLS * ROWS):
        batch  = qr_files[offset : offset + COLS * ROWS]
        sheets += 1

        # ── Front ────────────────────────────────────────────────────────────
        front = out.new_page(width=PAGE_W, height=PAGE_H)
        stamped_fronts = [make_front(front_doc, qr) for qr in batch]

        for i, (fdoc, qr_path) in enumerate(zip(stamped_fronts, batch)):
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
            back.show_pdf_page(cell_rect(b_col, row), back_doc, 0,
                               rotate=b_rotate)

        draw_cut_lines(back)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(out_path), deflate=True, garbage=4)

    print(f"✓ {len(qr_files)} handbills · {sheets} sheet(s) · {out.page_count} pages")
    print(f"  {out_path}")
    print()
    print("  Left col: 90°  (head → center)")
    print("  Right col: 270° (head → center)")
    print("  Print duplex, flip on long edge — backs align after cut")

    # Post-generation QR validation
    import subprocess
    print("\n── Validating QR renders ──\n")
    result = subprocess.run(
        [sys.executable, str(REPO_ROOT / "scripts" / "validate-print-qr.py"),
         "--sheet", str(out_path), "--save-crops"],
    )
    if result.returncode:
        print("\n⚠ QR validation failed — check print/qc/ for failed crops")
        sys.exit(1)


if __name__ == "__main__":
    main()
