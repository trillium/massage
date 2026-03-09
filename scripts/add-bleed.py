#!/usr/bin/env python3
"""
add-bleed.py — Add 0.125" bleed to template-v3.pdf

Approach: show_pdf_page for main content, then redraw overflow paths in bleed zone.
"""
import fitz
from pathlib import Path

REPO = Path(__file__).parent.parent
INPUT = REPO / "print" / "business-cards" / "template-v3.pdf"
OUTPUT = REPO / "print" / "business-cards" / "template-v3-bleed.pdf"

BLEED_PT = 0.125 * 72  # 9pt
ORIG_W = 252.0
ORIG_H = 144.0
NEW_W = ORIG_W + 2 * BLEED_PT
NEW_H = ORIG_H + 2 * BLEED_PT


def path_overflows(path):
    r = path["rect"]
    return r.x0 < 0 or r.y0 < 0 or r.x1 > ORIG_W or r.y1 > ORIG_H


def redraw_path(shape, path, ox, oy):
    for item in path["items"]:
        op = item[0]
        if op == "l":
            shape.draw_line(
                fitz.Point(item[1].x + ox, item[1].y + oy),
                fitz.Point(item[2].x + ox, item[2].y + oy),
            )
        elif op == "re":
            rect = item[1]
            shape.draw_rect(
                fitz.Rect(rect.x0 + ox, rect.y0 + oy, rect.x1 + ox, rect.y1 + oy)
            )
        elif op == "c":
            shape.draw_bezier(
                fitz.Point(item[1].x + ox, item[1].y + oy),
                fitz.Point(item[2].x + ox, item[2].y + oy),
                fitz.Point(item[3].x + ox, item[3].y + oy),
                fitz.Point(item[4].x + ox, item[4].y + oy),
            )
        elif op == "qu":
            shape.draw_quad(
                fitz.Quad(
                    fitz.Point(item[1].ul.x + ox, item[1].ul.y + oy),
                    fitz.Point(item[1].ur.x + ox, item[1].ur.y + oy),
                    fitz.Point(item[1].ll.x + ox, item[1].ll.y + oy),
                    fitz.Point(item[1].lr.x + ox, item[1].lr.y + oy),
                )
            )

    fill = path.get("fill")
    color = path.get("color")
    width = path.get("width", 0)
    even_odd = path.get("even_odd", False)
    closePath = path.get("closePath", False)
    fill_opacity = path.get("fill_opacity", 1.0)
    if fill == (0.0, 0.0, 0.0) and fill_opacity == 1.0:
        fill_opacity = 0.15
    shape.finish(
        fill=fill,
        color=color,
        width=width,
        even_odd=even_odd,
        closePath=closePath,
        fill_opacity=fill_opacity,
    )


def add_bleed_to_page(src_doc, page_idx, out_doc):
    src_page = src_doc[page_idx]
    new_page = out_doc.new_page(width=NEW_W, height=NEW_H)

    # 1. Dark bg fills entire page including bleed
    new_page.draw_rect(new_page.rect, color=None, fill=(0.122, 0.122, 0.122), width=0)

    # 2. Place original page content (clipped at original boundary)
    content_rect = fitz.Rect(BLEED_PT, BLEED_PT, BLEED_PT + ORIG_W, BLEED_PT + ORIG_H)
    new_page.show_pdf_page(content_rect, src_doc, page_idx)

    # 3. Redraw overflow paths in the bleed zone
    paths = src_page.get_drawings()
    overflow_paths = [
        p for p in paths
        if path_overflows(p) and p.get("fill_opacity", 1.0) > 0
    ]
    print(f"  Page {page_idx + 1}: {len(overflow_paths)} overflow paths (of {len(paths)} total)")

    for p in overflow_paths:
        shape = new_page.new_shape()
        redraw_path(shape, p, BLEED_PT, BLEED_PT)
        shape.commit()

    # Redraw content on top so windows/details aren't covered by overflow fills
    new_page.show_pdf_page(content_rect, src_doc, page_idx)


def main():
    src = fitz.open(str(INPUT))
    out = fitz.open()

    for i in range(src.page_count):
        add_bleed_to_page(src, i, out)

    out.save(str(OUTPUT), deflate=True, garbage=4)
    w_in = NEW_W / 72
    h_in = NEW_H / 72
    print(f"\n✓ Saved {OUTPUT.name}: {NEW_W:.0f}×{NEW_H:.0f} pt ({w_in:.3f}×{h_in:.3f} in)")


if __name__ == "__main__":
    main()
