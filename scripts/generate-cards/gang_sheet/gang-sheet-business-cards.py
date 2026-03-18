#!/usr/bin/env python3
"""Gang sheet business card generator — orchestration template."""

import argparse
import math
import sys
from pathlib import Path

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

sys.path.insert(0, str(Path(__file__).parent.parent))
from layouts import LAYOUTS
from generator import generate_gang_sheets, generate_split
from pipeline import ensure_cards


REPO_ROOT = Path(__file__).parent.parent.parent.parent
DEFAULT_CARD_DIR = REPO_ROOT / "print" / "2026-03-09_business-card-bleed"
OUT_DIR = REPO_ROOT / "print" / "business-cards"


def main():
    parser = argparse.ArgumentParser(description="Full pipeline: QR → cards → gang sheets")
    parser.add_argument("--cards", default=str(DEFAULT_CARD_DIR))
    parser.add_argument(
        "--paper",
        choices=["8.5x11_4r2c", "8.5x11_5r2c", "11x17_7r2c", "11x17_4r4c", "12x18_8r3c", "13x19_5r5c", "both"],
        default="both",
    )
    parser.add_argument("--count", type=int, default=250, help="Base card count (before padding)")
    parser.add_argument("--output-dir", default=str(OUT_DIR), help="Output directory for PDFs")
    args = parser.parse_args()

    card_dir = Path(args.cards)
    output_dir = Path(args.output_dir)
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
    all_cards = ensure_cards(REPO_ROOT, card_dir, needed)

    print()
    generate_gang_sheets(all_cards, papers, base_count, output_dir, LAYOUTS)

    print()
    generate_split(all_cards, output_dir)


if __name__ == "__main__":
    main()
