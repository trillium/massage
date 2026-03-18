"""Layout and drawing helpers for gang sheet generation."""

import fitz

from constants import BLEED, CROP_COLOR, CROP_GAP, CROP_LEN, CROP_WIDTH, LABEL_COLOR, LABEL_SIZE
from layouts import CARD_BLEED_H, CARD_BLEED_W


def cell_rect(col, row, mx, my, cw, ch):
    """Return the rect for card at (col, row)."""
    x0 = mx + col * cw
    y0 = my + row * ch
    return fitz.Rect(x0, y0, x0 + cw, y0 + ch)


def draw_crop_marks(page, mx, my, layout, count):
    """Draw crop marks around the card grid."""
    shape = page.new_shape()
    cols, rows = layout["cols"], layout["rows"]
    cw, ch = layout["cell_w"], layout["cell_h"]
    actual_rows = min(rows, (count + cols - 1) // cols)

    trim_xs = set()
    trim_ys = set()
    for row in range(actual_rows):
        cols_in_row = cols if row < actual_rows - 1 else count - (actual_rows - 1) * cols
        for col in range(cols_in_row):
            cr = cell_rect(col, row, mx, my, cw, ch)
            trim_xs.update([cr.x0 + BLEED, cr.x1 - BLEED])
            trim_ys.update([cr.y0 + BLEED, cr.y1 - BLEED])

    grid_top = my + BLEED
    grid_bot = my + actual_rows * ch - BLEED
    grid_left = mx + BLEED
    grid_right = mx + cols * cw - BLEED

    for x in sorted(trim_xs):
        shape.draw_line(
            fitz.Point(x, grid_top - CROP_GAP - CROP_LEN),
            fitz.Point(x, grid_top - CROP_GAP),
        )
        shape.draw_line(
            fitz.Point(x, grid_bot + CROP_GAP),
            fitz.Point(x, grid_bot + CROP_GAP + CROP_LEN),
        )

    for y in sorted(trim_ys):
        shape.draw_line(
            fitz.Point(grid_left - CROP_GAP - CROP_LEN, y),
            fitz.Point(grid_left - CROP_GAP, y),
        )
        shape.draw_line(
            fitz.Point(grid_right + CROP_GAP, y),
            fitz.Point(grid_right + CROP_GAP + CROP_LEN, y),
        )

    shape.finish(color=CROP_COLOR, width=CROP_WIDTH)
    shape.commit()


def draw_label(page, mx, my, side, sheet_num, total_sheets, n_up):
    """Draw a label indicating sheet info."""
    text = f"{side} · Sheet {sheet_num}/{total_sheets} · {n_up}-up · Flip on short edge"
    page.insert_text(fitz.Point(mx, my - 20), text, fontsize=LABEL_SIZE, color=LABEL_COLOR)
