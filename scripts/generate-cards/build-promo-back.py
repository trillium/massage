#!/usr/bin/env python3
"""
build-promo-back.py

Builds a handbill BACK template by swapping the promo copy on BACK_CC_BEV_2.pdf.
Defaults produce the GATHER50 back (print/templates/BACK_GATHER50.pdf).

Usage:
  python3 scripts/generate-cards/build-promo-back.py
  python3 scripts/generate-cards/build-promo-back.py --out print/templates/BACK_X.pdf \
    --headline "..." --line "..." --line "**BOLD ACCENT LINE" --line "..."
"""
import argparse
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
HEADLINE_BASELINE = 304
BODY_FIRST_BASELINE = 387
LEADING = 41
BOLD_MARKER = "**"

DEFAULT_HEADLINE = "50% Off on AirBNB!"
DEFAULT_LINES = [
    "Book a session through my",
    "AirBNB listing with code",
    "**GATHER50",
    "for 50% off, up to $300.",
    "Offer ends October 28th!",
]


def font_path(weight: str) -> Path:
    path = FONT_CACHE / FONTS[weight]
    if not path.exists():
        FONT_CACHE.mkdir(parents=True, exist_ok=True)
        print(f"  fetching {FONTS[weight]} → {FONT_CACHE}")
        urllib.request.urlretrieve(f"{FONT_BASE_URL}/{FONTS[weight]}", path)
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


def build(headline: str, lines: list[str], out_path: Path) -> None:
    doc = fitz.open(str(SOURCE_BACK))
    page = doc[0]
    clear_copy_area(page)

    write_line(page, HEADLINE_BASELINE, headline, bold=True, color=WHITE)
    for i, line in enumerate(lines):
        baseline = BODY_FIRST_BASELINE + i * LEADING
        if line.startswith(BOLD_MARKER):
            write_line(page, baseline, line[len(BOLD_MARKER):], bold=True, color=ACCENT)
        else:
            write_line(page, baseline, line, bold=False, color=WHITE)

    doc.subset_fonts()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(out_path), deflate=True, garbage=4)
    print(f"✓ {out_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    parser.add_argument("--headline", default=DEFAULT_HEADLINE)
    parser.add_argument("--line", action="append", dest="lines",
                        help=f"Body line; repeatable. Prefix with {BOLD_MARKER} for bold accent.")
    args = parser.parse_args()

    if not SOURCE_BACK.exists():
        sys.exit(f"Source back template not found: {SOURCE_BACK}")

    build(args.headline, args.lines or DEFAULT_LINES, Path(args.out))


if __name__ == "__main__":
    main()
