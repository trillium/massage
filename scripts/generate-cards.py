#!/usr/bin/env python3
"""
generate-cards.py

Produce individual business card PDFs from a 2-page PDF template.

Template requirements:
  - Page 1: front (used as-is)
  - Page 2: back (green #00EE00 square replaced with QR code)

Output: print/{YYYY-MM-DD}_{card_type}/card-{slug}.pdf  (one per QR code)

Usage:
  python3 scripts/generate-cards.py
  python3 scripts/generate-cards.py --template print/business-cards/template-v3.pdf
  python3 scripts/generate-cards.py --prefix handbill_ --type handbill
"""

import argparse
import json
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
QR_DIR = REPO_ROOT / "print" / "qr"
DEFAULT_TEMPLATE = REPO_ROOT / "print" / "business-cards" / "template-v3.pdf"
COLORS_PATH = REPO_ROOT / "lib" / "qr" / "print-colors.json"

GREEN_PX = {"x": 664, "y": 176, "size": 326}
PX_TO_PT = 72 / 300
GREEN = fitz.Rect(
    GREEN_PX["x"] * PX_TO_PT,
    GREEN_PX["y"] * PX_TO_PT,
    (GREEN_PX["x"] + GREEN_PX["size"]) * PX_TO_PT,
    (GREEN_PX["y"] + GREEN_PX["size"]) * PX_TO_PT,
)
QR_RECT = fitz.Rect(GREEN.x0, GREEN.y0, GREEN.x1, GREEN.y1)


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


BORDER_PT = 1.8

def make_back(template: fitz.Document, qr_path: Path, colors: dict) -> fitz.Document:
    doc = fitz.open()
    doc.insert_pdf(template, from_page=1, to_page=1)
    page = doc[0]

    border_rect = fitz.Rect(
        GREEN.x0 - BORDER_PT,
        GREEN.y0 - BORDER_PT,
        GREEN.x1 + BORDER_PT,
        GREEN.y1 + BORDER_PT,
    )
    page.draw_rect(border_rect, color=colors["containerBg"], fill=colors["containerBg"], width=0)

    qr_pdf = svg_to_vector_pdf(qr_path)
    page.show_pdf_page(QR_RECT, qr_pdf, 0, keep_proportion=False)

    return doc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", default=str(DEFAULT_TEMPLATE))
    parser.add_argument("--prefix", default="BC-")
    parser.add_argument("--type", default="business-card", dest="card_type")
    parser.add_argument("--count", type=int, default=0, help="Limit number of cards (0=all)")
    args = parser.parse_args()

    template_path = Path(args.template)
    if not template_path.exists():
        sys.exit(f"Template not found: {template_path}")

    colors = load_colors()

    template = fitz.open(str(template_path))
    if template.page_count < 2:
        sys.exit("Template PDF needs 2 pages (front + back)")

    qr_files = sorted(QR_DIR.glob(f"{args.prefix}*.svg"))
    if not qr_files:
        sys.exit(f"No {args.prefix}*.svg in {QR_DIR}")

    if args.count > 0:
        qr_files = qr_files[: args.count]

    out_dir = REPO_ROOT / "print" / f"{date.today()}_{args.card_type}"
    out_dir.mkdir(parents=True, exist_ok=True)

    page_w = template[0].rect.width
    page_h = template[0].rect.height

    for i, qr_path in enumerate(qr_files):
        slug = qr_path.stem
        out_path = out_dir / f"card-{slug}.pdf"

        card = fitz.open()

        front_page = card.new_page(width=page_w, height=page_h)
        front_page.show_pdf_page(front_page.rect, template, 0)

        back_doc = make_back(template, qr_path, colors)
        card.insert_pdf(back_doc)

        card.save(str(out_path), deflate=True, garbage=4)
        print(f"  [{i + 1}/{len(qr_files)}] {slug}")

    print(f"\n✓ {len(qr_files)} cards → {out_dir}/")


if __name__ == "__main__":
    main()
