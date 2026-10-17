import sys
from pathlib import Path
import fitz
from PIL import Image

HERE = Path(__file__).parent
ASSETS = HERE / "assets"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "out"

RED = (0.863, 0.149, 0.149)
INK = (0.12, 0.12, 0.12)
MUTED = (0.4, 0.4, 0.4)
HILITE = (1, 0.96, 0.62)
LETTER_W, LETTER_H = 612, 792
GAP = 4

RATE_LINES = [
    "Reduced rate per guest: [ $____ ]",
    "Guests per visit: [ ___ to ___ ]",
    "Session length: [ ___ min ]",
]
RATE_NOTE = "PLACEHOLDERS - Trillium fills in before printing"


def text_width(s, size, font):
    return fitz.get_text_length(s, fontname=font, fontsize=size)


def txt(p, y, s, size, x0, x1, color=INK, font="hebo", align=1):
    w = text_width(s, size, font)
    x = x0 if align == 0 else (x1 - w if align == 2 else (x0 + x1) / 2 - w / 2)
    p.insert_text((x, y + size), s, fontsize=size, fontname=font, color=color)


def wrap(s, size, font, width):
    lines, line = [], ""
    for word in s.split():
        trial = f"{line} {word}".strip()
        if text_width(trial, size, font) <= width:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line]


def paragraph(p, y, s, size, x0, x1, color=INK, font="helv", align=0, leading=1.3):
    for line in wrap(s, size, font, x1 - x0):
        txt(p, y, line, size, x0, x1, color, font, align)
        y += size * leading
    return y


def image_height(name, w):
    iw, ih = Image.open(ASSETS / name).size
    return w * ih / iw


def photo(p, x, y, w, name):
    h = image_height(name, w)
    p.insert_image(fitz.Rect(x, y, x + w, y + h), filename=str(ASSETS / name))
    return h


def collage_height(w2):
    return w2 * 333 / 512 + GAP + ((w2 - GAP) / 2) * 276 / 252


def collage_widths(total):
    lo, hi = 20, total
    for _ in range(60):
        mid = (lo + hi) / 2
        if collage_height(mid) * 512 / 768 + GAP + mid > total:
            hi = mid
        else:
            lo = mid
    h = collage_height(lo)
    return h * 512 / 768, lo, h


def collage(p, x, y, total):
    w1, w2, h = collage_widths(total)
    p.insert_image(fitz.Rect(x, y, x + w1, y + h), filename=str(ASSETS / "portrait.jpg"))
    rx = x + w1 + GAP
    th = w2 * 333 / 512
    p.insert_image(fitz.Rect(rx, y, rx + w2, y + th), filename=str(ASSETS / "panel-top.png"))
    sw = (w2 - GAP) / 2
    sh = sw * 276 / 252
    p.insert_image(fitz.Rect(rx, y + th + GAP, rx + sw, y + th + GAP + sh),
                   filename=str(ASSETS / "panel-bl.png"))
    p.insert_image(fitz.Rect(rx + sw + GAP, y + th + GAP, rx + w2, y + th + GAP + sh),
                   filename=str(ASSETS / "panel-br.png"))
    return h


def qr(p, x, y, size):
    svg = fitz.open(str(ASSETS / "qr-airbnb.svg"))
    pdf = fitz.open("pdf", svg.convert_to_pdf())
    p.show_pdf_page(fitz.Rect(x, y, x + size, y + size), pdf, 0)


def coupon_caption(p, y, x0, x1, size=12):
    txt(p, y, "Code GATHER50 for 50% off 90m+", size, x0, x1, RED)
    txt(p, y + size * 1.5, "Expires 10/28", size, x0, x1, RED)
    txt(p, y + size * 3.4, "airbnb.com/sv/trillium", size - 2, x0, x1, MUTED, "helv")


def signature(p, y, x0, x1, size=14):
    txt(p, y, "Trillium Smith, LMT  ·  818-738-5344", size, x0, x1)


def rate_box(p, x, y, w, size=11):
    h = len(RATE_LINES) * size * 1.7 + size * 2.4
    rect = fitz.Rect(x, y, x + w, y + h)
    p.draw_rect(rect, color=RED, fill=HILITE, width=1.2, dashes="[4 3] 0")
    ty = y + 7
    for line in RATE_LINES:
        txt(p, ty, line, size, x + 8, x + w - 8, INK, "hebo", 0)
        ty += size * 1.7
    txt(p, ty + 1, RATE_NOTE, size - 3, x + 8, x + w - 8, RED, "helv", 0)
    return h


def group_heading(p, y, x0, x1, size=18, align=0):
    txt(p, y, "Group & Office Visits", size, x0, x1, RED, "hebo", align)


PITCH = "Bring massage to your office. Treat your team or a few friends in one visit, at a reduced rate per guest."
STEPS = ["Pick a day and a quiet space.", "Guests book their time.", "I come to you and treat each guest in turn."]


def steps(p, y, x0, x1, size=11):
    for i, s in enumerate(STEPS, 1):
        txt(p, y, f"{i}.", size, x0, x1, RED, "hebo", 0)
        y = paragraph(p, y, s, size, x0 + 16, x1, INK, "helv") + 4
    return y


def new_doc():
    return fitz.open()


def finish(doc, name):
    OUT.mkdir(parents=True, exist_ok=True)
    pdf_path = OUT / f"{name}.pdf"
    doc.save(str(pdf_path))
    for i, page in enumerate(doc):
        page.get_pixmap(dpi=150).save(str(OUT / f"{name}-p{i + 1}.png"))


def fold_marks(p, xs, h):
    for x in xs:
        p.draw_line((x, 0), (x, 8), color=MUTED, width=0.5)
        p.draw_line((x, h - 8), (x, h), color=MUTED, width=0.5)


def build_trifold():
    doc = new_doc()
    pw = 792 / 3
    m = 20
    outside = doc.new_page(width=792, height=612)
    inflap = (0, pw)
    back = (pw, 2 * pw)
    front = (2 * pw, 3 * pw)

    x0, x1 = inflap[0] + m, inflap[1] - m
    group_heading(outside, 70, x0, x1, 20)
    y = paragraph(outside, 102, PITCH, 13, x0, x1) + 14
    y = steps(outside, y, x0, x1, 12) + 12
    rate_box(outside, x0, y, x1 - x0, 12)

    x0, x1 = back[0] + m, back[1] - m
    txt(outside, 70, "Book with the Airbnb listing", 14, x0, x1)
    qs = 190
    qr(outside, (x0 + x1) / 2 - qs / 2, 100, qs)
    coupon_caption(outside, 100 + qs + 12, x0, x1, 13)
    txt(outside, 480, "Massage therapist with 14 years experience.", 10, x0, x1, INK, "helv")
    signature(outside, 560, x0, x1, 12)

    x0, x1 = front[0] + m, front[1] - m
    txt(outside, 56, "Let The Spa", 30, x0, x1)
    txt(outside, 90, "Come To You", 30, x0, x1)
    txt(outside, 132, "In-Home Massage Therapy", 14, x0, x1, RED)
    hy = 170
    hh = photo(outside, x0, hy, x1 - x0, "hero.png")
    txt(outside, hy + hh + 22, "Group & Office Visits", 17, x0, x1, RED)
    paragraph(outside, hy + hh + 48, "Massage for multiple guests at a reduced rate", 10.5, x0, x1,
              INK, "helv", 1)
    signature(outside, 560, x0, x1, 12)
    fold_marks(outside, [pw, 2 * pw], 612)

    inside = doc.new_page(width=792, height=612)
    x0, x1 = m, pw - m
    ph = photo(inside, x0, 40, x1 - x0, "portrait.jpg")
    txt(inside, 40 + ph + 18, "Trillium Smith, LMT", 15, x0, x1)
    txt(inside, 40 + ph + 40, "Massage therapist with 14 years experience.", 10, x0, x1, INK, "helv")

    x0, x1 = pw + m, 2 * pw - m
    txt(inside, 110, "Mobile Relaxation Service", 17, x0, x1)
    y = paragraph(inside, 136, "Offering Massage Therapy to the greater Los Angeles area", 12, x0, x1,
                  INK, "helv", 1) + 12
    ch = collage(inside, x0, y, x1 - x0)

    x0, x1 = 2 * pw + m, 3 * pw - m
    group_heading(inside, 90, x0, x1, 18)
    y = paragraph(inside, 120, "Reduced rate for multiple guests in one visit.", 13, x0, x1) + 10
    y += rate_box(inside, x0, y, x1 - x0, 12) + 30
    txt(inside, y, "Coupon on the table", 14, x0, x1, INK, "hebo", 1)
    coupon_caption(inside, y + 28, x0, x1, 12)
    signature(inside, 560, x0, x1, 12)
    fold_marks(inside, [pw, 2 * pw], 612)
    finish(doc, "A-trifold-brochure")


def build_booklet():
    doc = new_doc()
    pw, ph_ = 396, 612
    m = 32
    sheet1 = doc.new_page(width=792, height=612)

    def region(page, left):
        off = 0 if left else pw
        return off + m, off + pw - m

    x0, x1 = region(sheet1, False)
    txt(sheet1, 60, "Let The Spa", 36, x0, x1)
    txt(sheet1, 100, "Come To You", 36, x0, x1)
    txt(sheet1, 150, "In-Home Massage Therapy", 16, x0, x1, RED)
    hy = 195
    hh = photo(sheet1, x0, hy, x1 - x0, "hero.png")
    txt(sheet1, hy + hh + 36, "Group & Office Visits", 22, x0, x1, RED)
    paragraph(sheet1, hy + hh + 70, "Massage for multiple guests at a reduced rate", 14, x0, x1,
              INK, "helv", 1)
    signature(sheet1, 540, x0, x1, 13)

    x0, x1 = region(sheet1, True)
    txt(sheet1, 80, "Book with the Airbnb listing", 16, x0, x1)
    qs = 230
    qr(sheet1, (x0 + x1) / 2 - qs / 2, 116, qs)
    coupon_caption(sheet1, 116 + qs + 14, x0, x1, 15)
    txt(sheet1, 470, "Massage therapist with 14 years experience.", 11, x0, x1, INK, "helv")
    signature(sheet1, 540, x0, x1, 13)
    sheet1.draw_line((pw, 0), (pw, 612), color=(0.85, 0.85, 0.85), width=0.4)

    sheet2 = doc.new_page(width=792, height=612)
    x0, x1 = region(sheet2, True)
    txt(sheet2, 90, "Mobile Relaxation Service", 19, x0, x1)
    y = paragraph(sheet2, 118, "Offering Massage Therapy to the greater Los Angeles area", 12, x0, x1,
                  INK, "helv", 1) + 14
    y += collage(sheet2, x0, y, x1 - x0) + 16
    txt(sheet2, y, "Trillium Smith, LMT", 15, x0, x1)
    txt(sheet2, y + 22, "Massage therapist with 14 years experience.", 11, x0, x1, INK, "helv")

    x0, x1 = region(sheet2, False)
    group_heading(sheet2, 80, x0, x1, 22)
    y = paragraph(sheet2, 120, PITCH, 14, x0, x1) + 16
    y = steps(sheet2, y, x0, x1, 13) + 14
    y += rate_box(sheet2, x0, y, x1 - x0, 13) + 34
    txt(sheet2, y, "Coupon on the table", 15, x0, x1, INK, "hebo", 1)
    coupon_caption(sheet2, y + 30, x0, x1, 13)
    sheet2.draw_line((pw, 0), (pw, 612), color=(0.85, 0.85, 0.85), width=0.4)
    finish(doc, "B-booklet")


def tear_strip(p, x, y, w, h):
    p.draw_rect(fitz.Rect(x, y, x + w, y + h), color=MUTED, width=0.6, dashes="[3 3] 0")
    qs = w - 14
    qr(p, x + 7, y + 10, qs)
    cy = y + 10 + qs + 8
    txt(p, cy, "GATHER50", 11, x, x + w, RED)
    txt(p, cy + 15, "50% off 90m+", 9, x, x + w, INK)
    txt(p, cy + 27, "Expires 10/28", 9, x, x + w, INK, "helv")
    txt(p, cy + 42, "818-738-5344", 8, x, x + w, MUTED, "helv")
    txt(p, cy + 53, "Trillium Smith, LMT", 7, x, x + w, MUTED, "helv")


def build_sheet():
    doc = new_doc()
    p = doc.new_page(width=LETTER_W, height=LETTER_H)
    m = 28.8
    W = LETTER_W - 2 * m
    txt(p, m, "Let The Spa Come To You", 26, m, LETTER_W - m, INK, "hebo", 0)
    txt(p, m + 6, "In-Home Massage Therapy", 14, m, LETTER_W - m, RED, "hebo", 2)
    p.draw_line((m, m + 40), (LETTER_W - m, m + 40), color=RED, width=2)

    ry = m + 52
    hw = 360
    hh = photo(p, m, ry, hw, "hero.png")
    cx0, cx1 = m + hw + 16, LETTER_W - m
    group_heading(p, ry, cx0, cx1, 17)
    y = paragraph(p, ry + 26, PITCH, 11, cx0, cx1) + 6
    rate_box(p, cx0, y, cx1 - cx0, 10)

    ry2 = ry + hh + 18
    cw = 345
    ch = collage(p, m, ry2, cw)
    tx0 = m + cw + 16
    txt(p, ry2, "Mobile Relaxation Service", 15, tx0, cx1, INK, "hebo", 0)
    y = paragraph(p, ry2 + 22, "Offering Massage Therapy to the greater Los Angeles area", 11,
                  tx0, cx1) + 8
    y = steps(p, y, tx0, cx1, 11) + 6
    paragraph(p, y, "Massage therapist with 14 years experience.", 11, tx0, cx1, INK, "helv")

    sy = ry2 + ch + 20
    txt(p, sy, "Take a coupon - tear along the dashed lines", 11, m, LETTER_W - m, MUTED, "helv", 0)
    sy += 18
    n = 6
    sw = W / n
    sh = 792 - m - 34 - sy
    for i in range(n):
        tear_strip(p, m + i * sw, sy, sw, sh)
    p.draw_line((m, 792 - m - 22), (LETTER_W - m, 792 - m - 22), color=INK, width=0.75)
    signature(p, 792 - m - 14, m, LETTER_W - m, 13)
    finish(doc, "C-coupon-sheet")


if __name__ == "__main__":
    build_trifold()
    build_booklet()
    build_sheet()
