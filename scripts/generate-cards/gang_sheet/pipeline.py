"""Card generation pipeline for gang sheets."""

import subprocess
import sys
from pathlib import Path


def count_qr_svgs(qr_dir):
    """Count existing QR SVGs."""
    return len(list(qr_dir.glob("BC01-*.svg")))


def count_card_pdfs(card_dir):
    """Count existing card PDFs."""
    return len(list(card_dir.glob("card-BC01-*.pdf")))


def generate_qr_svgs(repo_root, deficit):
    """Generate missing QR SVGs."""
    print(f"\n── Generating {deficit} QR SVGs ──\n")
    subprocess.run(
        [
            "pnpm",
            "tsx",
            "scripts/generate-pdf-card.ts",
            "--prefix=BC01-",
            f"--count={deficit}",
        ],
        check=True,
        cwd=str(repo_root),
    )


def generate_card_pdfs(repo_root, card_type):
    """Generate missing card PDFs."""
    existing_cards = {p.stem.replace("card-", "") for p in (repo_root / "print" / card_type).glob("card-BC01-*.pdf")}
    new_qrs = [
        qr
        for qr in sorted((repo_root / "print" / "qr").glob("BC01-*.svg"))
        if qr.stem not in existing_cards
    ]
    if not new_qrs:
        return

    print(f"\n── Generating {len(new_qrs)} card PDFs ──\n")
    subprocess.run(
        [
            sys.executable,
            str(repo_root / "scripts" / "generate-cards" / "generate-cards.py"),
            "--template",
            str(repo_root / "print" / "business-cards" / "template-v3-bleed.pdf"),
            "--prefix",
            "BC01-",
            "--type",
            "business-card-bleed",
        ],
        check=True,
        cwd=str(repo_root),
    )


def ensure_cards(repo_root, card_dir, needed):
    """Ensure enough cards exist."""
    qr_dir = repo_root / "print" / "qr"
    have_qrs = count_qr_svgs(qr_dir)
    have_cards = count_card_pdfs(card_dir)

    print(f"  Cards needed: {needed}")
    print(f"  QR SVGs:      {have_qrs}")
    print(f"  Card PDFs:    {have_cards}")

    qr_deficit = needed - have_qrs
    if qr_deficit > 0:
        generate_qr_svgs(repo_root, qr_deficit)

    card_deficit = needed - count_card_pdfs(card_dir)
    if card_deficit > 0:
        generate_card_pdfs(repo_root, "2026-03-18_business-card-bleed")

    final = count_card_pdfs(card_dir)
    if final < needed:
        sys.exit(f"Still only {final} cards after generation (need {needed})")

    return sorted(card_dir.glob("card-BC01-*.pdf"))[:needed]
