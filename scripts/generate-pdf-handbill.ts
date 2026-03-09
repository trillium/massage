import { generatePrint, parseArgs } from './generate-pdf-print'

const config = parseArgs({
  prefix: 'HB-',
  destination: 'https://trilliummassage.la/blog/airbnb-host-promo-2026-03',
  count: 6,
  regen: false,
})

generatePrint(config)
