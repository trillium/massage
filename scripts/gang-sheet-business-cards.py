#!/usr/bin/env python3
"""
gang-sheet-business-cards.py

Full pipeline: ensure enough cards exist, then produce gang sheets,
split FRONT/BACK files, for a given paper size.

Industry-standard layouts:
  12×18": 24-up (3 cols × 8 rows, landscape)
  13×19": 25-up (5 cols × 5 rows, portrait — cards rotated 90°)

Pipeline (only runs steps that are needed):
  1. Generate QR SVGs   → pnpm tsx scripts/generate-pdf-card.ts
  2. Generate card PDFs  → python3 scripts/generate-cards.py
  3. Assemble gang sheets with crop marks + labels
  4. Produce FRONT.pdf (1 page) + BACK.pdf (N pages)

Usage:
  python3 scripts/gang-sheet-business-cards.py --paper 12x18
  python3 scripts/gang-sheet-business-cards.py --paper 13x19
  python3 scripts/gang-sheet-business-cards.py --paper both
  python3 scripts/gang-sheet-business-cards.py --paper 12x18 --cards print/my-cards/

Output: print/business-cards/gang_{size}.pdf, FRONT.pdf, BACK.pdf
"""

import argparse
import json
import math
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
DEFAULT_CARD_DIR = REPO_ROOT / "print" / "2026-03-09_business-card-bleed"
OUT_DIR = REPO_ROOT / "print" / "business-cards"
QR_DIR = REPO_ROOT / "print" / "qr"

CARD_BLEED_W = 270.0  # 3.75" in pt (landscape)
CARD_BLEED_H = 162.0  # 2.25" in pt (landscape)
BLEED = 9.0  # 0.125" in pt

LAYOUTS = {
    "12x18": {
        "pw": 12 * 72,
        "ph": 18 * 72,
        "cols": 3,
        "rows": 8,
        "rotate": 0,
        "cell_w": CARD_BLEED_W,
        "cell_h": CARD_BLEED_H,
        "n_up": 24,
    },
    "13x19": {
        "pw": 13 * 72,
        "ph": 19 * 72,
        "cols": 5,
        "rows": 5,
        "rotate": 90,
        "cell_w": CARD_BLEED_H,
        "cell_h": CARD_BLEED_W,
        "n_up": 25,
    },
}

CROP_LEN = 18.0
CROP_GAP = 4.5
CROP_COLOR = (0, 0, 0)
CROP_WIDTH = 0.25
LABEL_COLOR = (0.4, 0.4, 0.4)
LABEL_SIZE = 7


# ── Layout helpers ────────────────────────────────────────────────────────────


def cell_rect(col, row, mx, my, cw, ch):
    x0 = mx + col * cw
    y0 = my + row * ch
    return fitz.Rect(x0, y0, x0 + cw, y0 + ch)


def draw_crop_marks(page, mx, my, layout, count):
    shape = page.new_shape()
    cols, rows = layout["cols"], layout["rows"]
    cw, ch = layout["cell_w"], layout["cell_h"]
    actual_rows = min(rows, (count + cols - 1) // cols)

    trim_xs = set()
    trim_ys = set()
    for row in range(actual_rows):
        cols_in_row = cols if row < actual_rows - 1 else count - (actual_rows - 1) * cols
        for col in range(cols_in_row):
            cr = cell_rect(col, row, mx, my, cw, ch)
            trim_xs.update([cr.x0 + BLEED, cr.x1 - BLEED])
            trim_ys.update([cr.y0 + BLEED, cr.y1 - BLEED])

    grid_top = my + BLEED
    grid_bot = my + actual_rows * ch - BLEED
    grid_left = mx + BLEED
    grid_right = mx + cols * cw - BLEED

    for x in sorted(trim_xs):
        shape.draw_line(
            fitz.Point(x, grid_top - CROP_GAP - CROP_LEN),
            fitz.Point(x, grid_top - CROP_GAP),
        )
        shape.draw_line(
            fitz.Point(x, grid_bot + CROP_GAP),
            fitz.Point(x, grid_bot + CROP_GAP + CROP_LEN),
        )

    for y in sorted(trim_ys):
        shape.draw_line(
            fitz.Point(grid_left - CROP_GAP - CROP_LEN, y),
            fitz.Point(grid_left - CROP_GAP, y),
        )
        shape.draw_line(
            fitz.Point(grid_right + CROP_GAP, y),
            fitz.Point(grid_right + CROP_GAP + CROP_LEN, y),
        )

    shape.finish(color=CROP_COLOR, width=CROP_WIDTH)
    shape.commit()


def draw_label(page, mx, my, side, sheet_num, total_sheets, n_up):
    text = f"{side} · Sheet {sheet_num}/{total_sheets} · {n_up}-up · Flip on short edge"
    page.insert_text(fitz.Point(mx, my - 20), text, fontsize=LABEL_SIZE, color=LABEL_COLOR)


# ── Card generation pipeline ─────────────────────────────────────────────────


def count_qr_svgs():
    return len(list(QR_DIR.glob("BC01-*.svg")))


def count_card_pdfs(card_dir):
    return len(list(card_dir.glob("card-BC01-*.pdf")))


def generate_qr_svgs(deficit):
    print(f"\n── Generating {deficit} QR SVGs ──\n")
    subprocess.run(
        [
            "pnpm", "tsx", "scripts/generate-pdf-card.ts",
            "--prefix=BC01-",
            f"--count={deficit}",
        ],
        check=True,
        cwd=str(REPO_ROOT),
    )


def generate_card_pdfs(card_dir):
    existing_cards = {p.stem.replace("card-", "") for p in card_dir.glob("card-BC01-*.pdf")}
    new_qrs = [
        qr for qr in sorted(QR_DIR.glob("BC01-*.svg"))
        if qr.stem not in existing_cards
    ]
    if not new_qrs:
        return

    print(f"\n── Generating {len(new_qrs)} card PDFs ──\n")
    subprocess.run(
        [
            sys.executable, str(REPO_ROOT / "scripts" / "generate-cards.py"),
            "--template", str(REPO_ROOT / "print" / "business-cards" / "template-v3-bleed.pdf"),
            "--prefix", "BC01-",
            "--type", "business-card-bleed",
        ],
        check=True,
        cwd=str(REPO_ROOT),
    )


def ensure_cards(needed, card_dir):
    have_qrs = count_qr_svgs()
    have_cards = count_card_pdfs(card_dir)

    print(f"  Cards needed: {needed}")
    print(f"  QR SVGs:      {have_qrs}")
    print(f"  Card PDFs:    {have_cards}")

    qr_deficit = needed - have_qrs
    if qr_deficit > 0:
        generate_qr_svgs(qr_deficit)

    card_deficit = needed - count_card_pdfs(card_dir)
    if card_deficit > 0:
        generate_card_pdfs(card_dir)

    final = count_card_pdfs(card_dir)
    if final < needed:
        sys.exit(f"Still only {final} cards after generation (need {needed})")

    return sorted(card_dir.glob("card-BC01-*.pdf"))[:needed]


# ── Gang sheet assembly ──────────────────────────────────────────────────────


def generate_gang_sheets(all_card_files, papers, base_count):
    for paper in papers:
        lay = LAYOUTS[paper]
        pw, ph = lay["pw"], lay["ph"]
        cols, rows = lay["cols"], lay["rows"]
        cw, ch = lay["cell_w"], lay["cell_h"]
        rot = lay["rotate"]
        n_up = lay["n_up"]

        cards_for_size = math.ceil(base_count / n_up) * n_up
        card_files = all_card_files[:cards_for_size]

        mx = (pw - cols * cw) / 2
        my = (ph - rows * ch) / 2

        out = fitz.open()
        sheets = 0
        total_sheets = cards_for_size // n_up

        for offset in range(0, len(card_files), n_up):
            batch = card_files[offset : offset + n_up]
            sheets += 1

            front = out.new_page(width=pw, height=ph)
            for i, card_path in enumerate(batch):
                col, row = i % cols, i // cols
                card_doc = fitz.open(str(card_path))
                front.show_pdf_page(
                    cell_rect(col, row, mx, my, cw, ch), card_doc, 0, rotate=rot
                )
            draw_crop_marks(front, mx, my, lay, len(batch))
            draw_label(front, mx, my, "FRONT", sheets, total_sheets, n_up)

            back = out.new_page(width=pw, height=ph)
            for i, card_path in enumerate(batch):
                col, row = i % cols, i // cols
                back_row = rows - row - 1
                card_doc = fitz.open(str(card_path))
                back.show_pdf_page(
                    cell_rect(col, back_row, mx, my, cw, ch), card_doc, 1, rotate=rot
                )
            draw_crop_marks(back, mx, my, lay, len(batch))
            draw_label(back, mx, my, "BACK", sheets, total_sheets, n_up)

        out_path = OUT_DIR / f"gang_{paper}.pdf"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out.save(str(out_path), deflate=True, garbage=4)

        print(f"✓ {paper}: {cards_for_size} cards · {n_up}-up · {sheets} full sheets · {out.page_count} pages → {out_path}")


def generate_split(card_files):
    front_doc = fitz.open(str(card_files[0]))
    front_out = fitz.open()
    front_page = front_out.new_page(width=CARD_BLEED_W, height=CARD_BLEED_H)
    front_page.show_pdf_page(front_page.rect, front_doc, 0)

    front_path = OUT_DIR / "FRONT.pdf"
    front_out.save(str(front_path), deflate=True, garbage=4)

    back_out = fitz.open()
    for card_path in card_files:
        card_doc = fitz.open(str(card_path))
        back_page = back_out.new_page(width=CARD_BLEED_W, height=CARD_BLEED_H)
        back_page.show_pdf_page(back_page.rect, card_doc, 1)

    back_path = OUT_DIR / "BACK.pdf"
    back_out.save(str(back_path), deflate=True, garbage=4)

    print(f"✓ FRONT.pdf: 1 page → {front_path}")
    print(f"✓ BACK.pdf: {len(card_files)} pages → {back_path}")


# ── Main ─────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="Full pipeline: QR → cards → gang sheets")
    parser.add_argument("--cards", default=str(DEFAULT_CARD_DIR))
    parser.add_argument("--paper", choices=["12x18", "13x19", "both"], default="both")
    parser.add_argument("--count", type=int, default=250, help="Base card count (before padding)")
    args = parser.parse_args()

    card_dir = Path(args.cards)
    papers = list(LAYOUTS.keys()) if args.paper == "both" else [args.paper]

    base_count = args.count
    needed = max(
        math.ceil(base_count / LAYOUTS[p]["n_up"]) * LAYOUTS[p]["n_up"]
        for p in papers
    )

    for p in papers:
        n = LAYOUTS[p]["n_up"]
        c = math.ceil(base_count / n) * n
        print(f"  {p}: {n}-up × {c // n} sheets = {c} cards")

    print(f"\n── Ensuring {needed} cards (base: {base_count}) ──\n")
    all_cards = ensure_cards(needed, card_dir)

    print()
    generate_gang_sheets(all_cards, papers, base_count)

    print()
    generate_split(all_cards)


if __name__ == "__main__":
    main()
