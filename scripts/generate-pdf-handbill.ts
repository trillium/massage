import { generatePrint, parseArgs } from './generate-pdf-print'

const config = parseArgs({
  prefix: 'HB-',
  destination: 'https://yourdomain.com/blog/your-blog-post',
  count: 6,
  regen: false,
})

generatePrint(config)
