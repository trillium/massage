#!/usr/bin/env bash
# ── CC-228 Business Card Print Sheet ──
# Edit the values below to match your cutter's settings.
# All measurements in inches.
#
# Run:  ./scripts/generate-cards/print-cc228.sh
# Output: print/business-cards/BC01_sheet.pdf

# ── How many cards? ──
PREFIX="BC01-"
COUNT=250

# ── CC-228 cutter layout (inches) ──
MARGIN_X=0.50     # left/right waste strip
MARGIN_Y=0.25     # top waste strip
COL_GAP=0.50      # center gutter (waste between columns)
ROW_GAP=0.125     # horizontal strip (waste between rows)

# ── Nudge (printer calibration offset) ──
# Base nudge applies to both sides unless overridden
NUDGE_X=0.0       # shift cards left/right (negative = left, positive = right)
NUDGE_Y=0.0       # shift cards up/down (negative = up)

# Per-side overrides (comment out to inherit from base nudge)
#NUDGE_FRONT_X="--nudge-front-x -0.03125"
#NUDGE_FRONT_Y="--nudge-front-y 0.0"
#NUDGE_BACK_X="--nudge-back-x 0.03125"
#NUDGE_BACK_Y="--nudge-back-y 0.0"

# ── Page size ──
PAGE_W=8.5
PAGE_H=11.0

# ── Show cut zone labels? (uncomment to show) ──
#SHOW_ZONES="--show-zones"

# ── Run ──
python3 "$(dirname "$0")/generate-print-sheet-business-cards.py" \
  --prefix="$PREFIX" \
  --count="$COUNT" \
  --margin-x "$MARGIN_X" \
  --margin-y "$MARGIN_Y" \
  --col-gap "$COL_GAP" \
  --row-gap "$ROW_GAP" \
  --nudge-x "$NUDGE_X" \
  --nudge-y "$NUDGE_Y" \
  --page-w "$PAGE_W" \
  --page-h "$PAGE_H" \
  ${NUDGE_FRONT_X:-} ${NUDGE_FRONT_Y:-} \
  ${NUDGE_BACK_X:-} ${NUDGE_BACK_Y:-} \
  ${SHOW_ZONES:-}
