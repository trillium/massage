#!/usr/bin/env python3
"""
generate-lockscreen.py

Creates a phone lockscreen wallpaper PNG with a native QR code.
QR is rendered at maximum width with minimal margins, centered vertically
below where the clock/timer displays.

Expects a pre-generated SVG in print/qr/<slug>.svg (use generate-handbills.ts
or generate-screen-qr.ts to create the SVG first).

Usage:
  python3 scripts/generate-lockscreen.py lockscreen01
  python3 scripts/generate-lockscreen.py lockscreen01 --device=iphone17promax
  python3 scripts/generate-lockscreen.py lockscreen01 --width=1320 --height=2868

Output: print/lockscreen-<slug>.png
"""
import argparse
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
QR_DIR = REPO_ROOT / "print" / "qr"
PRINT_DIR = REPO_ROOT / "print"

BG = (31 / 255, 31 / 255, 31 / 255)

DEVICES = {
    "iphone17promax": (1320, 2868),
    "iphone16promax": (1320, 2868),
    "iphone16pro": (1206, 2622),
    "iphone16": (1179, 2556),
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", help="QR slug (must have print/qr/<slug>.svg)")
    parser.add_argument("--device", default="iphone17promax",
                        choices=list(DEVICES.keys()),
                        help="Device preset (default: iphone17promax)")
    parser.add_argument("--width", type=int, default=None)
    parser.add_argument("--height", type=int, default=None)
    parser.add_argument("--margin", type=int, default=5,
                        help="Horizontal margin in px (default: 5)")
    parser.add_argument("--center-y", type=float, default=0.55,
                        help="Vertical center of QR as fraction of height (default: 0.55)")
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    svg_path = QR_DIR / f"{args.slug}.svg"
    if not svg_path.exists():
        sys.exit(f"SVG not found: {svg_path}")

    W, H = DEVICES[args.device]
    if args.width:
        W = args.width
    if args.height:
        H = args.height

    margin = args.margin
    qr_size = W - (margin * 2)
    qr_center_y = H * args.center_y
    qr_y = qr_center_y - (qr_size / 2)

    doc = fitz.open()
    page = doc.new_page(width=W, height=H)
    page.draw_rect(fitz.Rect(0, 0, W, H), color=BG, fill=BG)

    svg_doc = fitz.open("svg", svg_path.read_bytes())
    qr_pdf = fitz.open("pdf", svg_doc.convert_to_pdf())
    qr_rect = fitz.Rect(margin, qr_y, margin + qr_size, qr_y + qr_size)
    page.show_pdf_page(qr_rect, qr_pdf, 0)

    out_path = Path(args.out) if args.out else PRINT_DIR / f"lockscreen-{args.slug}.png"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    pix = page.get_pixmap(dpi=72)
    pix.save(str(out_path))
    print(f"✓ {out_path} ({pix.width}x{pix.height})")


if __name__ == "__main__":
    main()
