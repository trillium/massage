#!/usr/bin/env python3
"""
build-bcr01-template.py

Builds a 2-page template PDF for BCR01 cards:
  Page 1 (front): square photo left + brand panel PDF right
  Page 2 (back):  MassageCardV3_bc02 (4).pdf (green QR placeholder)

Output: print/templates/BCR01_template.pdf
"""
import sys
import tempfile
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed. Run: pip3 install pymupdf")

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow not installed. Run: pip3 install pillow")

REPO_ROOT = Path(__file__).parent.parent.parent
CARD_W = 252.0  # 3.5" in pt
CARD_H = 144.0  # 2.0" in pt
PHOTO_W = CARD_H  # square = 144pt

PHOTO_PATH   = REPO_ROOT / "public/static/images/gallery/portrait_arms_crossed_burgundy.jpg"
BRAND_PATH   = Path.home() / "Downloads/Let the Spa Come to You (1).pdf"
BACK_PATH    = Path.home() / "Downloads/MassageCardV3_bc02 (4).pdf"
OUT_PATH     = REPO_ROOT / "print/templates/BCR01_template.pdf"

BG_COLOR = (0x1F / 255, 0x1F / 255, 0x1F / 255)  # slate #1F1F1F

def cover_crop(src: Path, size_px: int, y_pct: float = 0.20) -> str:
    """Crop image to square matching CSS object-fit:cover + object-position:center Y%.

    CSS rule: the Y% point of the image aligns with the Y% point of the container.
    So: top = (Y% × image_height) - (Y% × container_size)
    """
    img = Image.open(src).convert("RGB")
    w, h = img.size
    scale = size_px / w
    new_h = int(h * scale)
    img = img.resize((size_px, new_h), Image.LANCZOS)
    top = max(0, int(y_pct * new_h) - int(y_pct * size_px))
    bottom = top + size_px
    if bottom > new_h:
        bottom = new_h
        top = max(0, bottom - size_px)
    img = img.crop((0, top, size_px, bottom))
    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    img.save(tmp.name, "JPEG", quality=95)
    return tmp.name


def build_front(doc: fitz.Document) -> None:
    page = doc.new_page(width=CARD_W, height=CARD_H)

    # Slate background
    page.draw_rect(page.rect, color=None, fill=BG_COLOR, width=0)

    # Left: square photo — cover crop at 20% (matches HTML preview)
    cropped = cover_crop(PHOTO_PATH, size_px=600, y_pct=0.20)
    photo_rect = fitz.Rect(0, 0, PHOTO_W, CARD_H)
    page.insert_image(photo_rect, filename=cropped, keep_proportion=False)

    # Right: brand panel PDF
    brand_doc = fitz.open(str(BRAND_PATH))
    brand_rect = fitz.Rect(PHOTO_W, 0, CARD_W, CARD_H)
    page.show_pdf_page(brand_rect, brand_doc, 0, keep_proportion=False)
    brand_doc.close()

def main():
    for p in [PHOTO_PATH, BRAND_PATH, BACK_PATH]:
        if not p.exists():
            sys.exit(f"Missing: {p}")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    doc = fitz.open()
    print("Building front page...")
    build_front(doc)

    print("Adding back page...")
    back_doc = fitz.open(str(BACK_PATH))
    doc.insert_pdf(back_doc)
    back_doc.close()

    doc.save(str(OUT_PATH), deflate=True, garbage=4)
    print(f"✓ Template written to {OUT_PATH}")
    print(f"  Pages: {doc.page_count} (front + back)")

if __name__ == "__main__":
    main()
