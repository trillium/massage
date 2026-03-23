"""Helpers for CC-228 business card print sheets."""

import json
import subprocess
import tempfile
from pathlib import Path

import fitz

REPO_ROOT = Path(__file__).parent.parent.parent
COLORS_PATH = REPO_ROOT / "lib" / "qr" / "print-colors.json"

GREEN_PX = {"x": 664, "y": 176, "size": 326}
CARD_PX = {"w": 1050, "h": 600}
PX_TO_PT = 72 / 300
BORDER_PT = 1.8


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))


def load_colors():
    with open(COLORS_PATH) as f:
        raw = json.load(f)
    return {k: hex_to_rgb(v) for k, v in raw.items()}


def compute_green_rect(template_page):
    bleed_x = (template_page.rect.width - CARD_PX["w"] * PX_TO_PT) / 2
    bleed_y = (template_page.rect.height - CARD_PX["h"] * PX_TO_PT) / 2
    return fitz.Rect(
        GREEN_PX["x"] * PX_TO_PT + bleed_x,
        GREEN_PX["y"] * PX_TO_PT + bleed_y,
        (GREEN_PX["x"] + GREEN_PX["size"]) * PX_TO_PT + bleed_x,
        (GREEN_PX["y"] + GREEN_PX["size"]) * PX_TO_PT + bleed_y,
    )


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


def make_back(template: fitz.Document, qr_path: Path, colors: dict) -> fitz.Document:
    doc = fitz.open()
    doc.insert_pdf(template, from_page=1, to_page=1)
    page = doc[0]

    green = compute_green_rect(page)
    border_rect = fitz.Rect(
        green.x0 - BORDER_PT, green.y0 - BORDER_PT,
        green.x1 + BORDER_PT, green.y1 + BORDER_PT,
    )
    page.draw_rect(border_rect, color=colors["containerBg"], fill=colors["containerBg"], width=0)

    qr_pdf = svg_to_vector_pdf(qr_path)
    page.show_pdf_page(green, qr_pdf, 0, keep_proportion=False)

    return doc


def stamp_header(page, page_w, margin_y, sheet_num, total_sheets, side, page_num):
    label = f"{side.upper()} {sheet_num}/{total_sheets} pg {page_num}"
    fs = 7
    text_w = fitz.get_text_length(label, fontsize=fs)
    x = (page_w - text_w) / 2
    y = margin_y / 2 + fs / 2
    page.insert_text(fitz.Point(x, y), label, fontsize=fs, color=(0.55, 0.55, 0.55))


def draw_cc228_zones(page, page_w, page_h, margin_x, margin_y,
                     rows, card_w, card_h, row_gap, col_x_base):
    GRAY = (0.45, 0.45, 0.45)
    LIGHT = (0.65, 0.65, 0.65)
    grid_x0 = col_x_base[0]
    grid_x1 = col_x_base[1] + card_w
    grid_y0 = margin_y
    grid_y1 = margin_y + rows * card_h + (rows - 1) * row_gap
    gutter_left = grid_x0 + card_w
    gutter_right = col_x_base[1]
    gutter_cx = (gutter_left + gutter_right) / 2
    fs = 5

    def centered_text(x_center, y_center, text, fontsize=fs, color=GRAY, rotate=0):
        text_w = fitz.get_text_length(text, fontsize=fontsize)
        if rotate == 90:
            page.insert_text(
                fitz.Point(x_center + fontsize / 2, y_center + text_w / 2),
                text, fontsize=fontsize, color=color, rotate=90,
            )
        else:
            page.insert_text(
                fitz.Point(x_center - text_w / 2, y_center + fontsize / 2),
                text, fontsize=fontsize, color=color,
            )

    centered_text(page_w / 2, margin_y / 2, f"TOP CUT ({margin_y/72:.2f}\")")
    bottom_margin = page_h - grid_y1
    centered_text(page_w / 2, grid_y1 + bottom_margin / 2, f"BOTTOM CUT ({bottom_margin/72:.2f}\")")

    for r in range(rows):
        y_mid = grid_y0 + r * (card_h + row_gap) + card_h / 2
        centered_text(margin_x / 2, y_mid, f"L{r+1}", rotate=90)

    right_margin_cx = grid_x1 + (page_w - grid_x1) / 2
    for r in range(rows):
        y_mid = grid_y0 + r * (card_h + row_gap) + card_h / 2
        centered_text(right_margin_cx, y_mid, f"R{r+1}", rotate=90)

    for r in range(rows):
        y_mid = grid_y0 + r * (card_h + row_gap) + card_h / 2
        centered_text(gutter_cx, y_mid, f"C{r+1}", rotate=90)

    for r in range(rows - 1):
        strip_y0 = grid_y0 + (r + 1) * card_h + r * row_gap
        strip_cy = strip_y0 + row_gap / 2
        centered_text(page_w / 2, strip_cy, f"ROW STRIP {r+1}-{r+2}", fontsize=4, color=LIGHT)

    shape = page.new_shape()
    for r in range(rows):
        y_top = grid_y0 + r * (card_h + row_gap)
        y_bot = y_top + card_h
        shape.draw_line(fitz.Point(0, y_top), fitz.Point(page_w, y_top))
        shape.finish(color=LIGHT, width=0.3)
        shape.draw_line(fitz.Point(0, y_bot), fitz.Point(page_w, y_bot))
        shape.finish(color=LIGHT, width=0.3)
    for x in [grid_x0, gutter_left, gutter_right, grid_x1]:
        shape.draw_line(fitz.Point(x, 0), fitz.Point(x, page_h))
        shape.finish(color=LIGHT, width=0.3)
    shape.commit()
