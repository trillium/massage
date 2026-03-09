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
import sys
from datetime import date
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
QR_DIR = REPO_ROOT / "print" / "qr"
DEFAULT_TEMPLATE = REPO_ROOT / "print" / "business-cards" / "template-v3.pdf"

GREEN_PX = {"x": 664, "y": 176, "size": 326}
PX_TO_PT = 72 / 300
GREEN = fitz.Rect(
    GREEN_PX["x"] * PX_TO_PT,
    GREEN_PX["y"] * PX_TO_PT,
    (GREEN_PX["x"] + GREEN_PX["size"]) * PX_TO_PT,
    (GREEN_PX["y"] + GREEN_PX["size"]) * PX_TO_PT,
)

TEAL = (45 / 255, 212 / 255, 191 / 255)
BORDER_W = 1.5
BORDER_GAP = 1.5
QR_INSET = 0
QR_RECT = fitz.Rect(
    GREEN.x0 + QR_INSET,
    GREEN.y0 + QR_INSET,
    GREEN.x1 - QR_INSET,
    GREEN.y1 - QR_INSET,
)


def make_back(template: fitz.Document, qr_path: Path) -> fitz.Document:
    doc = fitz.open()
    doc.insert_pdf(template, from_page=1, to_page=1)
    page = doc[0]

    page.draw_rect(GREEN, color=TEAL, fill=TEAL, width=0)

    svg_doc = fitz.open("svg", qr_path.read_bytes())
    qr_pdf = fitz.open("pdf", svg_doc.convert_to_pdf())
    page.show_pdf_page(QR_RECT, qr_pdf, 0, keep_proportion=False)

    page.draw_rect(GREEN, color=TEAL, fill=None, width=BORDER_W)
    page.draw_rect(QR_RECT, color=TEAL, fill=None, width=BORDER_W)

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

        back_doc = make_back(template, qr_path)
        card.insert_pdf(back_doc)

        card.save(str(out_path), deflate=True, garbage=4)
        print(f"  [{i + 1}/{len(qr_files)}] {slug}")

    print(f"\n✓ {len(qr_files)} cards → {out_dir}/")


if __name__ == "__main__":
    main()
