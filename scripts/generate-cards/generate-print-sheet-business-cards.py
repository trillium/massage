#!/usr/bin/env python3
"""
generate-print-sheet-business-cards.py

10-up print sheet for duplex business cards (2 cols x 5 rows)
targeting the Duplo CC-228 card cutter.

Uses template-v3-bleed.pdf (2-page: front+back, 270x162pt with 0.125" bleed).
Card artwork prints at bleed size and overflows into waste zones.
Machine cuts at trim lines -> edge-to-edge color.

Duplex (short-edge flip = flip top/bottom):
  Front row N -> Back row (ROWS-1-N)

Output: print/business-cards/{scope}_sheet.pdf
"""

import argparse
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

from cc228_helpers import draw_cc228_zones, load_colors, make_back, stamp_header

REPO_ROOT = Path(__file__).parent.parent.parent
QR_DIR = REPO_ROOT / "print" / "qr"
DEFAULT_TEMPLATE = REPO_ROOT / "print" / "business-cards" / "template-v3-bleed.pdf"

CARD_W_PT = 252.0   # 3.5" trim
CARD_H_PT = 144.0   # 2.0" trim
BLEED = 9.0          # 0.125" bleed on each side
BLEED_W = CARD_W_PT + 2 * BLEED  # 270pt = 3.75"
BLEED_H = CARD_H_PT + 2 * BLEED  # 162pt = 2.25"

DEFAULTS = {
    "page_w": 8.5,
    "page_h": 11.0,
    "cols": 2,
    "rows": 5,
    "margin_x": 0.50,
    "margin_y": 0.25,
    "col_gap": 0.50,
    "row_gap": 0.125,
    "nudge_x": 0.0,
    "nudge_y": 0.0,
    "nudge_front_x": None,
    "nudge_front_y": None,
    "nudge_back_x": None,
    "nudge_back_y": None,
    "show_zones": False,
}

PAGE_W = PAGE_H = 0
COLS = ROWS = 0
MARGIN_X = MARGIN_Y = COL_GAP = ROW_GAP = 0
NUDGE = {"front": (0, 0), "back": (0, 0)}
SHOW_ZONES = False
COL_X_BASE = []


def apply_layout(cfg: dict) -> None:
    global PAGE_W, PAGE_H, COLS, ROWS, MARGIN_X, MARGIN_Y, COL_GAP, ROW_GAP
    global NUDGE, SHOW_ZONES, COL_X_BASE
    PAGE_W = cfg["page_w"] * 72
    PAGE_H = cfg["page_h"] * 72
    COLS = int(cfg["cols"])
    ROWS = int(cfg["rows"])
    MARGIN_X = cfg["margin_x"] * 72
    MARGIN_Y = cfg["margin_y"] * 72
    COL_GAP = cfg["col_gap"] * 72
    ROW_GAP = cfg["row_gap"] * 72
    SHOW_ZONES = cfg["show_zones"]

    base_x = cfg["nudge_x"] * 72
    base_y = cfg["nudge_y"] * 72
    front_x = cfg["nudge_front_x"] * 72 if cfg["nudge_front_x"] is not None else base_x
    front_y = cfg["nudge_front_y"] * 72 if cfg["nudge_front_y"] is not None else base_y
    back_x = cfg["nudge_back_x"] * 72 if cfg["nudge_back_x"] is not None else base_x
    back_y = cfg["nudge_back_y"] * 72 if cfg["nudge_back_y"] is not None else base_y
    NUDGE["front"] = (front_x, front_y)
    NUDGE["back"] = (back_x, back_y)
    COL_X_BASE = [MARGIN_X + c * (CARD_W_PT + COL_GAP) for c in range(COLS)]


def trim_rect(col: int, row: int, side: str = "front") -> fitz.Rect:
    nx, ny = NUDGE[side]
    x0 = COL_X_BASE[col] + nx
    y0 = MARGIN_Y + ny + row * (CARD_H_PT + ROW_GAP)
    return fitz.Rect(x0, y0, x0 + CARD_W_PT, y0 + CARD_H_PT)


def clip_rect_for_source() -> fitz.Rect:
    v_bleed = min(BLEED, ROW_GAP / 2) if ROW_GAP > 0 else BLEED
    clip_inset = BLEED - v_bleed
    return fitz.Rect(0, clip_inset, BLEED_W, BLEED_H - clip_inset)


def visible_rect(col: int, row: int, side: str = "front") -> fitz.Rect:
    tr = trim_rect(col, row, side)
    v_bleed = min(BLEED, ROW_GAP / 2) if ROW_GAP > 0 else BLEED
    return fitz.Rect(tr.x0 - BLEED, tr.y0 - v_bleed, tr.x1 + BLEED, tr.y1 + v_bleed)


def get_scope_from_filename(qr_files):
    stem = qr_files[0].stem
    if "_" in stem:
        return stem.split("_")[0]
    if "-" in stem:
        return stem.rsplit("-", 1)[0]
    return "default"


def build_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", default=str(DEFAULT_TEMPLATE))
    parser.add_argument("--scope", help="Scope name for output filename")
    parser.add_argument("--prefix", default="BC-", help="QR SVG prefix (default: BC-)")
    parser.add_argument("--count", type=int, default=0, help="Limit cards (0=all)")
    for key, default in DEFAULTS.items():
        flag = f"--{key.replace('_', '-')}"
        if isinstance(default, bool):
            parser.add_argument(flag, action="store_true", default=default)
        elif default is None:
            parser.add_argument(flag, type=float, default=None)
        else:
            parser.add_argument(flag, type=type(default), default=default)
    return parser


def main():
    args = build_parser().parse_args()
    cfg = {k: getattr(args, k) for k in DEFAULTS}
    apply_layout(cfg)

    template_path = Path(args.template)
    if not template_path.exists():
        sys.exit(f"Template not found: {template_path}")

    template = fitz.open(str(template_path))
    if template.page_count < 2:
        sys.exit("Template PDF needs 2 pages (front + back)")

    colors = load_colors()

    qr_files = sorted(QR_DIR.glob(f"{args.prefix}*.svg"))
    if not qr_files:
        sys.exit(f"No {args.prefix}*.svg in {QR_DIR}")
    if args.count > 0:
        qr_files = qr_files[:args.count]

    scope = args.scope if args.scope else get_scope_from_filename(qr_files)
    out_path = REPO_ROOT / "print" / "business-cards" / f"{scope}_sheet.pdf"

    out = fitz.open()
    cards_per_sheet = COLS * ROWS
    total_sheets = -(-len(qr_files) // cards_per_sheet)
    clip = clip_rect_for_source()

    for sheet_num, offset in enumerate(range(0, len(qr_files), cards_per_sheet), 1):
        batch = qr_files[offset : offset + cards_per_sheet]

        front = out.new_page(width=PAGE_W, height=PAGE_H)
        for i, qr_path in enumerate(batch):
            col, row = i % COLS, i // COLS
            front.show_pdf_page(visible_rect(col, row, "front"), template, 0, clip=clip)

        stamp_header(front, PAGE_W, MARGIN_Y, sheet_num, total_sheets, "front", sheet_num * 2 - 1)
        if SHOW_ZONES:
            draw_cc228_zones(front, PAGE_W, PAGE_H, MARGIN_X, MARGIN_Y,
                             ROWS, CARD_W_PT, CARD_H_PT, ROW_GAP, COL_X_BASE)

        back = out.new_page(width=PAGE_W, height=PAGE_H)
        for i, qr_path in enumerate(batch):
            col, row = i % COLS, i // COLS
            back_doc = make_back(template, qr_path, colors)
            back.show_pdf_page(visible_rect(col, ROWS - row - 1, "back"), back_doc, 0, clip=clip)

        stamp_header(back, PAGE_W, MARGIN_Y, sheet_num, total_sheets, "back", sheet_num * 2)
        if SHOW_ZONES:
            draw_cc228_zones(back, PAGE_W, PAGE_H, MARGIN_X, MARGIN_Y,
                             ROWS, CARD_W_PT, CARD_H_PT, ROW_GAP, COL_X_BASE)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(out_path), deflate=True, garbage=4)

    print(f"✓ {len(qr_files)} business cards · {total_sheets} sheet(s) · {out.page_count} pages")
    print(f"  {out_path}")
    print(f"  2×5 grid · bleed: {BLEED/72:.3f}\" · CC-228 layout")
    print(f"  Print duplex, flip on short edge — backs align after cut")


if __name__ == "__main__":
    main()
