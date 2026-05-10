import { generatePrint, parseArgs } from './generate-pdf-print'

const config = parseArgs({
  prefix: '',
  destination: 'https://yourdomain.com',
  count: 10,
  regen: false,
})

generatePrint(config)
