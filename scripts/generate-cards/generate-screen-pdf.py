#!/usr/bin/env python3
"""
generate-screen-pdf.py

Creates a single-page print-ready PDF with a QR code at maximum size.
Composes the green-square element with rounded corners, teal background,
double-border, and "SCAN TO BOOK" in OpenSans-Bold.

Usage:
  python3 scripts/generate-screen-pdf.py <slug>
  # e.g. python3 scripts/generate-screen-pdf.py screen_a1b2c3d4

Reads:  print/qr/<slug>.svg
Writes: print/<slug>.pdf
"""
import sys
import tempfile
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
DEFAULT_PDF = Path.home() / "Downloads" / "CC BEV (2).pdf"

TEAL = (45 / 255, 212 / 255, 191 / 255)   # #2dd4bf
SLATE = (31 / 255, 31 / 255, 31 / 255)     # #1f1f1f
GRAY = (0.45, 0.45, 0.45)

PAGE_W, PAGE_H = 612, 792   # US Letter
MARGIN = 36                  # 0.5 in

PRINTABLE_W = PAGE_W - 2 * MARGIN  # 540
PRINTABLE_H = PAGE_H - 2 * MARGIN  # 720

# Layout: teal rounded rect containing [pad | QR | pad | text | pad]
CORNER_R = 24        # corner radius
PAD_TOP = 20         # teal padding above QR
PAD_SIDE = 3         # teal padding left/right of QR border
PAD_BOTTOM = 16      # teal padding below text
TEXT_GAP = 12         # gap between QR bottom border and text
TEXT_SIZE = 59.6      # 2x template size for large print

BORDER_W = 2
BORDER_GAP = 2
QR_INSET = BORDER_W + BORDER_GAP + BORDER_W  # 6 pt


def draw_rounded_rect(page, rect, radius, fill, stroke=None, stroke_w=0):
    """Draw a rounded rectangle using quadratic Bézier corners."""
    shape = page.new_shape()
    r, R = rect, radius

    shape.draw_line(fitz.Point(r.x0 + R, r.y0), fitz.Point(r.x1 - R, r.y0))
    shape.draw_curve(fitz.Point(r.x1 - R, r.y0), fitz.Point(r.x1, r.y0), fitz.Point(r.x1, r.y0 + R))
    shape.draw_line(fitz.Point(r.x1, r.y0 + R), fitz.Point(r.x1, r.y1 - R))
    shape.draw_curve(fitz.Point(r.x1, r.y1 - R), fitz.Point(r.x1, r.y1), fitz.Point(r.x1 - R, r.y1))
    shape.draw_line(fitz.Point(r.x1 - R, r.y1), fitz.Point(r.x0 + R, r.y1))
    shape.draw_curve(fitz.Point(r.x0 + R, r.y1), fitz.Point(r.x0, r.y1), fitz.Point(r.x0, r.y1 - R))
    shape.draw_line(fitz.Point(r.x0, r.y1 - R), fitz.Point(r.x0, r.y0 + R))
    shape.draw_curve(fitz.Point(r.x0, r.y0 + R), fitz.Point(r.x0, r.y0), fitz.Point(r.x0 + R, r.y0))

    shape.finish(fill=fill, color=stroke, width=stroke_w, closePath=True)
    shape.commit()


def extract_bold_font(template_path: Path) -> bytes:
    """Extract OpenSans-Bold font data from the template PDF."""
    doc = fitz.open(str(template_path))
    for xref, _, _, name, _, _ in doc[0].get_fonts():
        if "Bold" in name and "Extra" not in name:
            return doc.extract_font(xref)[-1]
    sys.exit("OpenSans-Bold not found in template PDF")


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 scripts/generate-screen-pdf.py <slug>")

    slug = sys.argv[1]
    svg_path = REPO_ROOT / "print" / "qr" / f"{slug}.svg"
    out_path = REPO_ROOT / "print" / f"{slug}.pdf"

    if not svg_path.exists():
        sys.exit(f"SVG not found: {svg_path}")
    if not DEFAULT_PDF.exists():
        sys.exit(f"Template PDF not found: {DEFAULT_PDF}")

    bold_font_data = extract_bold_font(DEFAULT_PDF)
    bold_font = fitz.Font(fontbuffer=bold_font_data)
    bold_font_file = tempfile.NamedTemporaryFile(suffix=".ttf", delete=False)
    bold_font_file.write(bold_font_data)
    bold_font_file.close()

    # Compute layout: QR is square, width-constrained by printable area
    text_h = TEXT_SIZE * 1.2
    inner_w = PRINTABLE_W - 2 * PAD_SIDE  # QR border width
    qr_side = inner_w - 2 * QR_INSET
    total_h = PAD_TOP + QR_INSET + qr_side + QR_INSET + TEXT_GAP + text_h + PAD_BOTTOM

    # Outer teal rect (centered in printable area)
    ox = MARGIN
    oy = MARGIN + (PRINTABLE_H - total_h) / 2
    OUTER = fitz.Rect(ox, oy, ox + PRINTABLE_W, oy + total_h)

    # QR border rect (inset from outer by PAD_SIDE, below top padding)
    qr_border_y0 = OUTER.y0 + PAD_TOP
    QR_BORDER = fitz.Rect(
        OUTER.x0 + PAD_SIDE, qr_border_y0,
        OUTER.x1 - PAD_SIDE, qr_border_y0 + qr_side + 2 * QR_INSET,
    )

    # QR image rect (inside borders)
    QR_IMG = fitz.Rect(
        QR_BORDER.x0 + QR_INSET, QR_BORDER.y0 + QR_INSET,
        QR_BORDER.x1 - QR_INSET, QR_BORDER.y1 - QR_INSET,
    )

    # Build output
    doc = fitz.open()
    page = doc.new_page(width=PAGE_W, height=PAGE_H)

    # Teal rounded rect (no page background — this will be cut out)
    draw_rounded_rect(page, OUTER, CORNER_R, fill=TEAL)

    # QR code
    svg_doc = fitz.open("svg", svg_path.read_bytes())
    qr_pdf = fitz.open("pdf", svg_doc.convert_to_pdf())
    page.show_pdf_page(QR_IMG, qr_pdf, 0, keep_proportion=True)

    # Double border
    page.draw_rect(QR_BORDER, color=TEAL, fill=None, width=BORDER_W)
    page.draw_rect(QR_IMG, color=TEAL, fill=None, width=BORDER_W)

    # "SCAN TO BOOK" in OpenSans-Bold
    text = "SCAN TO BOOK"
    tw = bold_font.text_length(text, fontsize=TEXT_SIZE)
    text_x = OUTER.x0 + (OUTER.width - tw) / 2
    text_y = QR_BORDER.y1 + TEXT_GAP + TEXT_SIZE
    page.insert_text(fitz.Point(text_x, text_y), text,
                     fontname="OSB", fontfile=bold_font_file.name,
                     fontsize=TEXT_SIZE, color=SLATE)

    # URL label below the element
    url = f"trilliummassage.la/redirect/{slug}"
    url_fontsize = 10
    url_w = fitz.get_text_length(url, fontsize=url_fontsize)
    url_x = PAGE_W / 2 - url_w / 2
    url_y = OUTER.y1 + 20
    if url_y + url_fontsize < PAGE_H - MARGIN:
        page.insert_text(fitz.Point(url_x, url_y), url,
                         fontsize=url_fontsize, color=GRAY)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(out_path), deflate=True, garbage=4)
    print(f"✓ {out_path}")


if __name__ == "__main__":
    main()
