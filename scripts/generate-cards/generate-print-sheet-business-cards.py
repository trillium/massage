#!/usr/bin/env python3
"""
generate-print-sheet-business-cards.py

10-up print sheet for duplex business cards (2 cols × 5 rows)
targeting the Duplo CC-228 card cutter.

Uses template-v3-bleed.pdf (2-page: front+back, 270×162pt with 0.125" bleed).
Card artwork prints at bleed size and overflows into waste zones.
Machine cuts at trim lines → edge-to-edge color.

Duplex (short-edge flip = flip top↔bottom):
  Front row N → Back row (ROWS-1-N)

Usage:
  python3 scripts/generate-cards/generate-print-sheet-business-cards.py
  python3 scripts/generate-cards/generate-print-sheet-business-cards.py --margin-y 0.75

Output: print/business-cards/{scope}_sheet.pdf
"""

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent.parent
QR_DIR = REPO_ROOT / "print" / "qr"
DEFAULT_TEMPLATE = REPO_ROOT / "print" / "business-cards" / "template-v3-bleed.pdf"
COLORS_PATH = REPO_ROOT / "lib" / "qr" / "print-colors.json"

# Card dimensions (trim = what you keep, bleed = printed area)
CARD_W_PT = 252.0   # 3.5" trim
CARD_H_PT = 144.0   # 2.0" trim
BLEED = 9.0          # 0.125" bleed on each side
BLEED_W = CARD_W_PT + 2 * BLEED  # 270pt = 3.75"
BLEED_H = CARD_H_PT + 2 * BLEED  # 162pt = 2.25"

# Green square position in pixels (from template design, 300 DPI)
GREEN_PX = {"x": 664, "y": 176, "size": 326}
CARD_PX = {"w": 1050, "h": 600}
PX_TO_PT = 72 / 300
BORDER_PT = 1.8

# ── CC-228 layout defaults (all in inches) ──
# Measured from actual Duplo CC-228 machine cut output.
DEFAULTS = {
    "page_w": 8.5,
    "page_h": 11.0,
    "cols": 2,
    "rows": 5,
    "margin_x": 0.50,
    "margin_y": 0.25,
    "col_gap": 0.50,
    "row_gap": 0.125,
}

PAGE_W = PAGE_H = 0
COLS = ROWS = 0
MARGIN_X = MARGIN_Y = COL_GAP = ROW_GAP = 0
COL_X = []


def apply_layout(cfg: dict) -> None:
    global PAGE_W, PAGE_H, COLS, ROWS, MARGIN_X, MARGIN_Y, COL_GAP, ROW_GAP, COL_X
    PAGE_W = cfg["page_w"] * 72
    PAGE_H = cfg["page_h"] * 72
    COLS = int(cfg["cols"])
    ROWS = int(cfg["rows"])
    MARGIN_X = cfg["margin_x"] * 72
    MARGIN_Y = cfg["margin_y"] * 72
    COL_GAP = cfg["col_gap"] * 72
    ROW_GAP = cfg["row_gap"] * 72
    COL_X = [MARGIN_X + c * (CARD_W_PT + COL_GAP) for c in range(COLS)]


def trim_rect(col: int, row: int) -> fitz.Rect:
    x0 = COL_X[col]
    y0 = MARGIN_Y + row * (CARD_H_PT + ROW_GAP)
    return fitz.Rect(x0, y0, x0 + CARD_W_PT, y0 + CARD_H_PT)


def bleed_rect(col: int, row: int) -> fitz.Rect:
    tr = trim_rect(col, row)
    # Vertical bleed clamped to half the row gap so adjacent cards don't overlap
    v_bleed = min(BLEED, ROW_GAP / 2) if ROW_GAP > 0 else BLEED
    return fitz.Rect(tr.x0 - BLEED, tr.y0 - v_bleed, tr.x1 + BLEED, tr.y1 + v_bleed)


def compute_green_rect(template_page):
    bleed_x = (template_page.rect.width - CARD_PX["w"] * PX_TO_PT) / 2
    bleed_y = (template_page.rect.height - CARD_PX["h"] * PX_TO_PT) / 2
    return fitz.Rect(
        GREEN_PX["x"] * PX_TO_PT + bleed_x,
        GREEN_PX["y"] * PX_TO_PT + bleed_y,
        (GREEN_PX["x"] + GREEN_PX["size"]) * PX_TO_PT + bleed_x,
        (GREEN_PX["y"] + GREEN_PX["size"]) * PX_TO_PT + bleed_y,
    )


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))


def load_colors():
    with open(COLORS_PATH) as f:
        raw = json.load(f)
    return {k: hex_to_rgb(v) for k, v in raw.items()}


def svg_to_vector_pdf(svg_path: Path) -> fitz.Document:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = tmp.name
    subprocess.run(
        ["rsvg-convert", "-f", "pdf", "-o", tmp_path, str(svg_path)],
        check=True,
    )
    doc = fitz.open(tmp_path)
    Path(tmp_path).unlink()
    return doc


def make_back(template: fitz.Document, qr_path: Path, colors: dict) -> fitz.Document:
    doc = fitz.open()
    doc.insert_pdf(template, from_page=1, to_page=1)
    page = doc[0]

    green = compute_green_rect(page)
    border_rect = fitz.Rect(
        green.x0 - BORDER_PT, green.y0 - BORDER_PT,
        green.x1 + BORDER_PT, green.y1 + BORDER_PT,
    )
    page.draw_rect(border_rect, color=colors["containerBg"], fill=colors["containerBg"], width=0)

    qr_pdf = svg_to_vector_pdf(qr_path)
    page.show_pdf_page(green, qr_pdf, 0, keep_proportion=False)

    return doc


def draw_cc228_zones(page: fitz.Page) -> None:
    GRAY = (0.45, 0.45, 0.45)
    LIGHT = (0.65, 0.65, 0.65)
    grid_x0 = COL_X[0]
    grid_x1 = COL_X[1] + CARD_W_PT
    grid_y0 = MARGIN_Y
    grid_y1 = MARGIN_Y + ROWS * CARD_H_PT + (ROWS - 1) * ROW_GAP
    gutter_left = grid_x0 + CARD_W_PT
    gutter_right = COL_X[1]
    gutter_cx = (gutter_left + gutter_right) / 2
    fs = 5

    def centered_text(x_center, y_center, text, fontsize=fs, color=GRAY, rotate=0):
        text_w = fitz.get_text_length(text, fontsize=fontsize)
        if rotate == 90:
            page.insert_text(
                fitz.Point(x_center + fontsize / 2, y_center + text_w / 2),
                text, fontsize=fontsize, color=color, rotate=90,
            )
        else:
            page.insert_text(
                fitz.Point(x_center - text_w / 2, y_center + fontsize / 2),
                text, fontsize=fontsize, color=color,
            )

    centered_text(PAGE_W / 2, MARGIN_Y / 2, f"TOP CUT ({MARGIN_Y/72:.2f}\")")

    bottom_margin = PAGE_H - grid_y1
    centered_text(PAGE_W / 2, grid_y1 + bottom_margin / 2, f"BOTTOM CUT ({bottom_margin/72:.2f}\")")

    for r in range(ROWS):
        y_mid = grid_y0 + r * (CARD_H_PT + ROW_GAP) + CARD_H_PT / 2
        centered_text(MARGIN_X / 2, y_mid, f"L{r+1}", rotate=90)

    right_margin_cx = grid_x1 + (PAGE_W - grid_x1) / 2
    for r in range(ROWS):
        y_mid = grid_y0 + r * (CARD_H_PT + ROW_GAP) + CARD_H_PT / 2
        centered_text(right_margin_cx, y_mid, f"R{r+1}", rotate=90)

    for r in range(ROWS):
        y_mid = grid_y0 + r * (CARD_H_PT + ROW_GAP) + CARD_H_PT / 2
        centered_text(gutter_cx, y_mid, f"C{r+1}", rotate=90)

    for r in range(ROWS - 1):
        strip_y0 = grid_y0 + (r + 1) * CARD_H_PT + r * ROW_GAP
        strip_cy = strip_y0 + ROW_GAP / 2
        centered_text(PAGE_W / 2, strip_cy, f"ROW STRIP {r+1}-{r+2}", fontsize=4, color=LIGHT)

    shape = page.new_shape()
    for r in range(ROWS):
        y_top = grid_y0 + r * (CARD_H_PT + ROW_GAP)
        y_bot = y_top + CARD_H_PT
        shape.draw_line(fitz.Point(0, y_top), fitz.Point(PAGE_W, y_top))
        shape.finish(color=LIGHT, width=0.3)
        shape.draw_line(fitz.Point(0, y_bot), fitz.Point(PAGE_W, y_bot))
        shape.finish(color=LIGHT, width=0.3)
    for x in [grid_x0, gutter_left, gutter_right, grid_x1]:
        shape.draw_line(fitz.Point(x, 0), fitz.Point(x, PAGE_H))
        shape.finish(color=LIGHT, width=0.3)
    shape.commit()


def get_scope_from_filename(qr_files):
    stem = qr_files[0].stem
    if "_" in stem:
        return stem.split("_")[0]
    if "-" in stem:
        return stem.rsplit("-", 1)[0]
    return "default"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", default=str(DEFAULT_TEMPLATE))
    parser.add_argument("--scope", help="Scope name for output filename")
    for key, default in DEFAULTS.items():
        flag = f"--{key.replace('_', '-')}"
        parser.add_argument(flag, type=type(default), default=default,
                            help=f"(default: {default})")
    args = parser.parse_args()

    cfg = {k: getattr(args, k) for k in DEFAULTS}
    apply_layout(cfg)

    template_path = Path(args.template)
    if not template_path.exists():
        sys.exit(f"Template not found: {template_path}")

    template = fitz.open(str(template_path))
    if template.page_count < 2:
        sys.exit("Template PDF needs 2 pages (front + back)")

    colors = load_colors()

    qr_files = sorted(QR_DIR.glob("BC-*.svg"))
    if not qr_files:
        qr_files = sorted(QR_DIR.glob("businessCard_*.svg"))
    if not qr_files:
        sys.exit(f"No BC-*.svg or businessCard_*.svg in {QR_DIR}")

    scope = args.scope if args.scope else get_scope_from_filename(qr_files)
    out_path = REPO_ROOT / "print" / "business-cards" / f"{scope}_sheet.pdf"

    out = fitz.open()
    sheets = 0

    for offset in range(0, len(qr_files), COLS * ROWS):
        batch = qr_files[offset : offset + COLS * ROWS]
        sheets += 1

        # ── Front ──
        front = out.new_page(width=PAGE_W, height=PAGE_H)
        for i, qr_path in enumerate(batch):
            col, row = i % COLS, i // COLS
            # Place front (page 0) at bleed size, centered over trim
            front.show_pdf_page(bleed_rect(col, row), template, 0)

        draw_cc228_zones(front)

        # ── Back (short-edge duplex = flip rows top↔bottom) ──
        back = out.new_page(width=PAGE_W, height=PAGE_H)
        for i, qr_path in enumerate(batch):
            col, row = i % COLS, i // COLS
            back_row = ROWS - row - 1

            back_doc = make_back(template, qr_path, colors)
            back.show_pdf_page(bleed_rect(col, back_row), back_doc, 0)

        draw_cc228_zones(back)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(out_path), deflate=True, garbage=4)

    print(f"✓ {len(qr_files)} business cards · {sheets} sheet(s) · {out.page_count} pages")
    print(f"  {out_path}")
    print(f"  2×5 grid · bleed: {BLEED/72:.3f}\" · CC-228 layout")
    print(f"  Print duplex, flip on short edge — backs align after cut")


if __name__ == "__main__":
    main()
