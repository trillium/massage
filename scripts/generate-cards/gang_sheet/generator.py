"""Gang sheet and split PDF generation."""

import fitz
from helpers import draw_crop_marks, draw_label, cell_rect
from layouts import CARD_BLEED_H, CARD_BLEED_W


def generate_gang_sheets(all_card_files, papers, base_count, output_dir, layouts):
    """Generate gang sheets for each paper size."""
    for paper in papers:
        lay = layouts[paper]
        pw, ph = lay["pw"], lay["ph"]
        cols, rows = lay["cols"], lay["rows"]
        cw, ch = lay["cell_w"], lay["cell_h"]
        rot = lay["rotate"]
        n_up = lay["n_up"]

        cards_for_size = (base_count + n_up - 1) // n_up * n_up
        card_files = all_card_files[:cards_for_size]

        mx = (pw - cols * cw) / 2
        my = (ph - rows * ch) / 2

        out = fitz.open()
        sheets = 0
        total_sheets = cards_for_size // n_up

        for offset in range(0, len(card_files), n_up):
            batch = card_files[offset : offset + n_up]
            sheets += 1

            front = out.new_page(width=pw, height=ph)
            for i, card_path in enumerate(batch):
                col, row = i % cols, i // cols
                card_doc = fitz.open(str(card_path))
                front.show_pdf_page(
                    cell_rect(col, row, mx, my, cw, ch), card_doc, 0, rotate=rot
                )
            draw_crop_marks(front, mx, my, lay, len(batch))
            draw_label(front, mx, my, "FRONT", sheets, total_sheets, n_up)

            back = out.new_page(width=pw, height=ph)
            for i, card_path in enumerate(batch):
                col, row = i % cols, i // cols
                back_row = rows - row - 1
                card_doc = fitz.open(str(card_path))
                back.show_pdf_page(
                    cell_rect(col, back_row, mx, my, cw, ch), card_doc, 1, rotate=rot
                )
            draw_crop_marks(back, mx, my, lay, len(batch))
            draw_label(back, mx, my, "BACK", sheets, total_sheets, n_up)

        out_path = output_dir / f"gang_{paper}_3.5x2_{rows}r{cols}c_{cards_for_size}cards.pdf"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out.save(str(out_path), deflate=True, garbage=4)

        print(f"✓ {paper}: {cards_for_size} cards · {n_up}-up · {sheets} full sheets · {out.page_count} pages → {out_path}")


def generate_split(card_files, output_dir):
    """Generate split FRONT/BACK PDFs."""
    front_doc = fitz.open(str(card_files[0]))
    front_out = fitz.open()
    front_page = front_out.new_page(width=CARD_BLEED_W, height=CARD_BLEED_H)
    front_page.show_pdf_page(front_page.rect, front_doc, 0)

    front_path = output_dir / "FRONT.pdf"
    front_out.save(str(front_path), deflate=True, garbage=4)

    back_out = fitz.open()
    for card_path in card_files:
        card_doc = fitz.open(str(card_path))
        back_page = back_out.new_page(width=CARD_BLEED_W, height=CARD_BLEED_H)
        back_page.show_pdf_page(back_page.rect, card_doc, 1)

    back_path = output_dir / "BACK.pdf"
    back_out.save(str(back_path), deflate=True, garbage=4)

    print(f"✓ FRONT.pdf: 1 page → {front_path}")
    print(f"✓ BACK.pdf: {len(card_files)} pages → {back_path}")
