#!/usr/bin/env python3
"""validate-print-qr.py — post-generation validator for print sheet QR codes.

Two validation rules:
1. SOLID: Center of each QR must NOT be one solid color (SVG modules didn't render)
2. UNIQUE: Every QR crop must be distinct (identical pixels = rendering duplication)

At worst one false positive from the uniqueness check, which is acceptable.

Usage:
  python3 scripts/validate-print-qr.py
  python3 scripts/validate-print-qr.py --save-crops
"""
import argparse
import hashlib
import sys
from pathlib import Path

import numpy as np

try:
    import fitz
except ImportError:
    sys.exit("pymupdf not installed.  Run: pip3 install pymupdf")

REPO_ROOT = Path(__file__).parent.parent
DEFAULT_SHEET = REPO_ROOT / "print" / "sheet.pdf"
QC_DIR = REPO_ROOT / "print" / "qc"

# ── Layout constants (from generate-print-sheet.py) ────────────────────────
PAGE_W, PAGE_H = 612, 792
COLS, ROWS = 2, 3
GUTTER = 24
CELL_W = (PAGE_W - GUTTER) / COLS
CELL_H = PAGE_H / ROWS
COL_X = {0: 0, 1: CELL_W + GUTTER}
SCALE = min(CELL_W / PAGE_H, CELL_H / PAGE_W)
Y_PAD = (CELL_H - PAGE_W * SCALE) / 2

GREEN = fitz.Rect(343, 402, 579, 637.5)
QR_INSET = 6  # border frame: 2+2+2 pts
COL_ROTATE = {0: 270, 1: 90}

TEAL = np.array([45, 212, 191])
COLOR_TOLERANCE = 60

DPI = 300
PX_PER_PT = DPI / 72


def qr_inner_rect(col: int, row: int) -> fitz.Rect:
    """QR content area (inside teal border) in assembled sheet coordinates."""
    inner = fitz.Rect(
        GREEN.x0 + QR_INSET, GREEN.y0 + QR_INSET,
        GREEN.x1 - QR_INSET, GREEN.y1 - QR_INSET,
    )
    cx = COL_X[col]
    cy = row * CELL_H + Y_PAD

    if COL_ROTATE[col] == 270:
        rx0, ry0 = PAGE_H - inner.y1, inner.x0
        rx1, ry1 = PAGE_H - inner.y0, inner.x1
    else:
        rx0, ry0 = inner.y0, PAGE_W - inner.x1
        rx1, ry1 = inner.y1, PAGE_W - inner.x0

    return fitz.Rect(
        cx + rx0 * SCALE, cy + ry0 * SCALE,
        cx + rx1 * SCALE, cy + ry1 * SCALE,
    )


def crop_qr(arr: np.ndarray, rect: fitz.Rect) -> np.ndarray:
    x0 = max(0, int(rect.x0 * PX_PER_PT))
    y0 = max(0, int(rect.y0 * PX_PER_PT))
    x1 = min(arr.shape[1], int(rect.x1 * PX_PER_PT))
    y1 = min(arr.shape[0], int(rect.y1 * PX_PER_PT))
    return arr[y0:y1, x0:x1, :3]


def is_solid(crop: np.ndarray) -> bool:
    """Center 60% is one solid color → QR modules didn't render."""
    h, w = crop.shape[:2]
    m_y, m_x = h // 5, w // 5
    center = crop[m_y:h - m_y, m_x:w - m_x]
    return float(center.std()) < 12.0


def fingerprint(crop: np.ndarray) -> str:
    """Binarize (teal vs not) → downsample → hash for uniqueness."""
    dist = np.abs(crop.astype(np.int16) - TEAL).sum(axis=2)
    binary = (dist < COLOR_TOLERANCE).astype(np.uint8)
    from PIL import Image
    img = Image.fromarray(binary * 255).resize((64, 64), Image.NEAREST)
    return hashlib.sha256(np.array(img).tobytes()).hexdigest()[:16]


def save_crop_png(crop: np.ndarray, path: Path) -> None:
    from PIL import Image
    Image.fromarray(crop).save(str(path))


def validate(sheet_path: Path, save_crops: bool = False) -> list[dict]:
    doc = fitz.open(str(sheet_path))
    failures: list[dict] = []
    entries: list[dict] = []

    if save_crops:
        QC_DIR.mkdir(parents=True, exist_ok=True)

    for page_idx in range(0, doc.page_count, 2):
        page = doc[page_idx]
        sheet_num = page_idx // 2 + 1
        pix = page.get_pixmap(dpi=DPI)
        arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
            pix.height, pix.width, pix.n
        )

        for row in range(ROWS):
            for col in range(COLS):
                label = f"sheet {sheet_num}, row {row+1}, col {col+1}"
                rect = qr_inner_rect(col, row)
                crop = crop_qr(arr, rect)

                solid = is_solid(crop)
                if solid:
                    failures.append({"label": label, "reason": "solid"})
                    tag = "FAIL (solid — modules didn't render)"
                    if save_crops:
                        p = QC_DIR / f"s{sheet_num}_r{row+1}c{col+1}_SOLID.png"
                        save_crop_png(crop, p)
                else:
                    tag = "OK"
                print(f"  {label}: {tag}")

                entries.append({
                    "label": label, "fp": fingerprint(crop),
                    "crop": crop, "sheet": sheet_num, "row": row, "col": col,
                    "solid": solid,
                })

    # Rule 2: uniqueness
    seen: dict[str, str] = {}
    for e in entries:
        fp = e["fp"]
        if fp in seen:
            dup_of = seen[fp]
            already = any(f["label"] == e["label"] for f in failures)
            if not already:
                failures.append({
                    "label": e["label"],
                    "reason": f"duplicate of {dup_of}",
                })
                print(f"  {e['label']}: FAIL (duplicate of {dup_of})")
                if save_crops:
                    p = QC_DIR / f"s{e['sheet']}_r{e['row']+1}c{e['col']+1}_DUP.png"
                    save_crop_png(e["crop"], p)
        else:
            seen[fp] = e["label"]

    total = len(entries)
    print()
    if failures:
        print(f"✗ {len(failures)}/{total} QR cells FAILED")
        for f in failures:
            print(f"  - {f['label']}: {f['reason']}")
    else:
        print(f"✓ All {total} QR cells passed")

    return failures


def main():
    parser = argparse.ArgumentParser(description="Validate QR codes in print sheet")
    parser.add_argument("--sheet", default=str(DEFAULT_SHEET))
    parser.add_argument("--save-crops", action="store_true",
                        help="Save failed cell crops to print/qc/")
    args = parser.parse_args()

    sheet_path = Path(args.sheet)
    if not sheet_path.exists():
        sys.exit(f"Sheet not found: {sheet_path}")

    print(f"Validating: {sheet_path}\n")
    failures = validate(sheet_path, save_crops=args.save_crops)
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
