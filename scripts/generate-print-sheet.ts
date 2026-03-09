/**
 * generate-print-sheet.ts
 *
 * Generates a print-ready 6-up handbill sheet (2 columns × 3 rows per US Letter page).
 * Reads existing QR SVGs from print/qr/ and outputs print/sheet.html.
 *
 * Print at 100% scale, no scaling. Cut along dashed lines.
 *
 * Usage: pnpm tsx scripts/generate-print-sheet.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const QR_DIR = path.join(REPO_ROOT, 'print/qr')
const OUT_PATH = path.join(REPO_ROOT, 'print/sheet.html')
const BASE_URL = 'https://trilliummassage.la/rd'

function inlineSvg(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8')
}

function main() {
  const svgFiles = fs
    .readdirSync(QR_DIR)
    .filter((f) => f.endsWith('.svg') && f.startsWith('handbill_'))
    .sort()

  if (svgFiles.length === 0) {
    console.error('No handbill SVGs found in print/qr/. Run generate-handbills.ts first.')
    process.exit(1)
  }

  // Build handbill card HTML — each card is one cell in the 6-up grid
  const cards = svgFiles.map((file) => {
    const slug = file.replace('.svg', '')
    const svgPath = path.join(QR_DIR, file)
    const svgContent = inlineSvg(svgPath)
    const shortUrl = `${BASE_URL}/${slug}`

    return `<div class="card">
  <div class="qr">${svgContent}</div>
  <div class="info">
    <div class="cta">Book a massage today</div>
    <div class="url">${shortUrl}</div>
  </div>
</div>`
  })

  // Group into pages of 6
  const pages: string[] = []
  for (let i = 0; i < cards.length; i += 6) {
    const batch = cards.slice(i, i + 6)
    // Pad to 6 cells so grid stays consistent
    while (batch.length < 6) batch.push('<div class="card empty"></div>')
    pages.push(`<div class="page">\n${batch.join('\n')}\n</div>`)
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Handbill Print Sheet — 6-up US Letter</title>
<style>
  /* ── Reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Screen preview ── */
  body {
    background: #555;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }

  /* ── Page: US Letter 8.5" × 11" ── */
  .page {
    width: 8.5in;
    height: 11in;
    background: white;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(3, 1fr);
    gap: 0;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }

  /* ── Card cell ── */
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.25in 0.2in 0.15in;
    border: 1px dashed #ccc;
    gap: 0.1in;
    overflow: hidden;
  }
  .card.empty { background: #fafafa; }

  /* ── QR code: fills most of the card ── */
  .qr {
    width: 2.4in;
    height: 2.4in;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* ── Text below QR ── */
  .info {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .cta {
    font-size: 11pt;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.01em;
  }
  .url {
    font-size: 7.5pt;
    color: #555;
    font-family: monospace;
    word-break: break-all;
  }

  /* ── Print: suppress screen chrome ── */
  @page {
    size: letter portrait;
    margin: 0;
  }
  @media print {
    body {
      background: white;
      padding: 0;
      gap: 0;
      display: block;
    }
    .page {
      page-break-after: always;
      break-after: page;
      box-shadow: none;
      width: 100%;
      height: 100%;
    }
    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
  }
</style>
</head>
<body>
${pages.join('\n')}
<script>
  // Screen info banner
  const count = ${svgFiles.length};
  const pages = ${pages.length};
  const banner = document.createElement('div');
  banner.style.cssText = 'background:#222;color:#eee;font-family:monospace;font-size:13px;padding:12px 20px;border-radius:6px;text-align:center';
  banner.innerHTML = count + ' handbills · ' + pages + ' page' + (pages > 1 ? 's' : '') + ' · Print at 100% / Actual Size · No scaling';
  document.body.insertBefore(banner, document.body.firstChild);
</script>
</body>
</html>`

  fs.writeFileSync(OUT_PATH, html)
  console.log(`✓ ${svgFiles.length} handbills → ${pages.length} page(s)`)
  console.log(`  Output: ${OUT_PATH}`)
  console.log(`  Open in browser and File → Print → "Actual Size" / 100%`)
}

main()
