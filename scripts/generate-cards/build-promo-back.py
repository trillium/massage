#!/usr/bin/env python3
"""
build-promo-back.py

Builds print/templates/BACK_GATHER50.pdf by swapping the promo copy on BACK_CC_BEV_2.pdf.

Usage:
  python3 scripts/generate-cards/build-promo-back.py
"""
import sys
import urllib.request
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent.parent
SOURCE_BACK = REPO_ROOT / "print" / "templates" / "BACK_CC_BEV_2.pdf"
DEFAULT_OUT = REPO_ROOT / "print" / "templates" / "BACK_GATHER50.pdf"

FONT_CACHE = Path.home() / ".cache" / "trillium-print" / "fonts"
FONT_BASE_URL = "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf"
FONTS = {"bold": "Montserrat-Bold.ttf", "light": "Montserrat-Light.ttf"}

BACKGROUND = (31 / 255, 31 / 255, 31 / 255)
WHITE = (1, 1, 1)
ACCENT = (255 / 255, 189 / 255, 74 / 255)

COPY_AREA = fitz.Rect(60, 250, 560, 580)
TEXT_X = 76
FONT_SIZE = 29.7
HEADLINE = "50% Off on AirBNB!"
HEADLINE_BASELINE = 304
BODY_FIRST_BASELINE = 387
LEADING = 41
BODY_LINES = [
    ("Book a session through my", False),
    ("AirBNB listing with code", False),
    ("GATHER50", True),
    ("for 50% off, up to $300.", False),
    ("Offer ends October 28th!", False),
]


def font_path(weight: str) -> Path:
    path = FONT_CACHE / FONTS[weight]
    if not path.exists():
        FONT_CACHE.mkdir(parents=True, exist_ok=True)
        print(f"  fetching {FONTS[weight]} → {FONT_CACHE}")
        partial = path.with_suffix(".part")
        urllib.request.urlretrieve(f"{FONT_BASE_URL}/{FONTS[weight]}", partial)
        partial.replace(path)
    return path


def clear_copy_area(page: fitz.Page) -> None:
    page.add_redact_annot(COPY_AREA, fill=BACKGROUND)
    page.apply_redactions(
        images=fitz.PDF_REDACT_IMAGE_NONE,
        graphics=fitz.PDF_REDACT_LINE_ART_NONE,
    )


def write_line(page: fitz.Page, baseline: float, text: str, bold: bool, color) -> None:
    weight = "bold" if bold else "light"
    page.insert_text(
        fitz.Point(TEXT_X, baseline),
        text,
        fontsize=FONT_SIZE,
        fontname=f"Montserrat-{weight}",
        fontfile=str(font_path(weight)),
        color=color,
    )


def build() -> None:
    doc = fitz.open(str(SOURCE_BACK))
    page = doc[0]
    clear_copy_area(page)

    write_line(page, HEADLINE_BASELINE, HEADLINE, bold=True, color=WHITE)
    for i, (text, accent) in enumerate(BODY_LINES):
        baseline = BODY_FIRST_BASELINE + i * LEADING
        if accent:
            write_line(page, baseline, text, bold=True, color=ACCENT)
        else:
            write_line(page, baseline, text, bold=False, color=WHITE)

    doc.subset_fonts()
    DEFAULT_OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(DEFAULT_OUT), deflate=True, garbage=4)
    print(f"✓ {DEFAULT_OUT}")


def main() -> None:
    if not SOURCE_BACK.exists():
        sys.exit(f"Source back template not found: {SOURCE_BACK}")

    build()


if __name__ == "__main__":
    main()
