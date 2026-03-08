#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CARD_FRONT="$SCRIPT_DIR/template.png"
CARD_BACK="$SCRIPT_DIR/template-back.png"
QR_DIR="$REPO_ROOT/print/qr"
OUTPUT_PDF="$SCRIPT_DIR/print-sheet.pdf"
WORK="$SCRIPT_DIR/.tmp"

QR_PREFIX="${1:-businessCard_}"
TOTAL="${2:-10}"

rm -rf "$WORK"
mkdir -p "$WORK"

QR_SVGS=($(ls "$QR_DIR"/${QR_PREFIX}*.svg 2>/dev/null | sort | head -"$TOTAL"))

if [ ${#QR_SVGS[@]} -eq 0 ]; then
  echo "No QR SVGs matching '${QR_PREFIX}*' in $QR_DIR"
  echo "Generate them first:"
  echo "  pnpm tsx scripts/generate-handbills.ts --prefix=${QR_PREFIX} --count=$TOTAL --destination=https://trilliummassage.la"
  exit 1
fi

if [ ${#QR_SVGS[@]} -lt "$TOTAL" ]; then
  echo "Only found ${#QR_SVGS[@]} of $TOTAL requested QR SVGs"
  echo "Generate more: pnpm tsx scripts/generate-handbills.ts --prefix=${QR_PREFIX} --count=$((TOTAL - ${#QR_SVGS[@]})) --destination=https://trilliummassage.la"
  exit 1
fi

SHEETS=$(( (${#QR_SVGS[@]} + 9) / 10 ))
echo "${#QR_SVGS[@]} QR codes → $SHEETS sheet(s) (front+back each)"

# Green square location: 327x327 at +664+176 (color #00EE00)
GR_X=664
GR_Y=176
GR_SIZE=327

# Letter paper at 300 DPI = 2550x3300 px
PAGE_W=2550
PAGE_H=3300
MARGIN_X=75
MARGIN_Y=75
CARD_W=1050
CARD_H=600
COL_GAP=300
ROW_GAP=37

COL1_X=$MARGIN_X
COL2_X=$((MARGIN_X + CARD_W + COL_GAP))
GRID_RIGHT=$((COL2_X + CARD_W))

BASE_URL="trilliummassage.la/redirect"

# ── Build cut lines SVG ─────────────────────────────────────────────────────
build_lines_svg() {
  local show_labels="$1"
  local count="$2"
  local offset="$3"

  echo "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"$PAGE_W\" height=\"$PAGE_H\">"
  echo "  <rect width=\"100%\" height=\"100%\" fill=\"white\"/>"
  echo "  <g stroke=\"#aaa\" stroke-width=\"1\" stroke-dasharray=\"10,8\" fill=\"none\">"

  for x in $COL1_X $((COL1_X + CARD_W)) $COL2_X $GRID_RIGHT; do
    Y_START=$MARGIN_Y
    Y_END=$((MARGIN_Y + CARD_H * 5 + ROW_GAP * 4))
    echo "    <line x1=\"$x\" y1=\"$Y_START\" x2=\"$x\" y2=\"$Y_END\"/>"
  done

  for row in $(seq 0 4); do
    Y=$((MARGIN_Y + row * (CARD_H + ROW_GAP)))
    echo "    <line x1=\"$COL1_X\" y1=\"$Y\" x2=\"$GRID_RIGHT\" y2=\"$Y\"/>"
  done
  Y=$((MARGIN_Y + 4 * (CARD_H + ROW_GAP) + CARD_H))
  echo "    <line x1=\"$COL1_X\" y1=\"$Y\" x2=\"$GRID_RIGHT\" y2=\"$Y\"/>"

  echo "  </g>"

  if [ "$show_labels" = "true" ]; then
    echo "  <g fill=\"#999\" font-family=\"monospace\" font-size=\"16\">"
    for i in $(seq 0 $((count - 1))); do
      col=$((i % 2))
      row=$((i / 2))
      if [ "$col" -eq 0 ]; then
        x=$COL1_X
      else
        x=$COL2_X
      fi
      label_y=$((MARGIN_Y + row * (CARD_H + ROW_GAP) + CARD_H + 4))
      gutter_center=$((x + CARD_W / 2))
      slug_idx=$((offset + i))
      echo "    <text x=\"$gutter_center\" y=\"$((label_y + 16))\" text-anchor=\"middle\">$BASE_URL/${ALL_SLUGS[$slug_idx]}</text>"
    done
    echo "  </g>"
  fi

  echo "</svg>"
}

# ── Generate card PNGs with QR overlay ───────────────────────────────────────
echo "Generating ${#QR_SVGS[@]} card variants..."

ALL_SLUGS=()
for i in $(seq 0 $((${#QR_SVGS[@]} - 1))); do
  svg="${QR_SVGS[$i]}"
  slug=$(basename "$svg" .svg)
  ALL_SLUGS+=("$slug")
  out="$WORK/card-$i.png"
  qr_png="$WORK/qr-$i.png"

  rsvg-convert -w "$GR_SIZE" -h "$GR_SIZE" "$svg" -o "$qr_png"

  magick "$CARD_FRONT" -colorspace sRGB \
    -fuzz 2% -fill "#1a1a1a" -opaque "#00EE00" \
    "$qr_png" -geometry "+${GR_X}+${GR_Y}" -composite \
    "$out"
  echo "  Card $((i+1)): $slug"
done

# ── Build sheets ─────────────────────────────────────────────────────────────
PAGE_PNGS=()

for sheet in $(seq 0 $((SHEETS - 1))); do
  offset=$((sheet * 10))
  count=10
  remaining=$((${#QR_SVGS[@]} - offset))
  if [ "$remaining" -lt 10 ]; then
    count=$remaining
  fi

  echo ""
  echo "Sheet $((sheet + 1))/$SHEETS (cards $((offset + 1))-$((offset + count)))..."

  # ── Front page ──
  build_lines_svg "true" "$count" "$offset" > "$WORK/front-$sheet.svg"
  magick -background white "$WORK/front-$sheet.svg" -colorspace sRGB "$WORK/front-lines-$sheet.png"

  CMD="magick $WORK/front-lines-$sheet.png -colorspace sRGB"
  for i in $(seq 0 $((count - 1))); do
    card_idx=$((offset + i))
    col=$((i % 2))
    row=$((i / 2))
    if [ "$col" -eq 0 ]; then
      x=$COL1_X
    else
      x=$COL2_X
    fi
    y=$((MARGIN_Y + row * (CARD_H + ROW_GAP)))
    CMD="$CMD $WORK/card-$card_idx.png -geometry +${x}+${y} -composite"
  done
  eval "$CMD -colorspace sRGB $WORK/front-$sheet.png"
  PAGE_PNGS+=("$WORK/front-$sheet.png")

  # ── Back page ──
  build_lines_svg "false" "$count" "$offset" > "$WORK/back-$sheet.svg"
  magick -background white "$WORK/back-$sheet.svg" -colorspace sRGB "$WORK/back-lines-$sheet.png"

  CMD="magick $WORK/back-lines-$sheet.png -colorspace sRGB"
  for i in $(seq 0 $((count - 1))); do
    col=$((i % 2))
    row=$((i / 2))
    if [ "$col" -eq 0 ]; then
      x=$COL1_X
    else
      x=$COL2_X
    fi
    y=$((MARGIN_Y + row * (CARD_H + ROW_GAP)))
    CMD="$CMD $CARD_BACK -geometry +${x}+${y} -composite"
  done
  eval "$CMD -colorspace sRGB $WORK/back-$sheet.png"
  PAGE_PNGS+=("$WORK/back-$sheet.png")
done

# ── Combine all pages into single PDF ────────────────────────────────────────
echo ""
echo "Combining ${#PAGE_PNGS[@]} pages into PDF..."

magick "${PAGE_PNGS[@]}" -colorspace sRGB -density 300 -units PixelsPerInch "$OUTPUT_PDF"

echo ""
echo "Done!"
echo "  PDF: $OUTPUT_PDF (${#PAGE_PNGS[@]} pages: $SHEETS front + $SHEETS back)"
echo "  Print duplex, flip on short edge — backs align after cut"

rm -rf "$WORK"
