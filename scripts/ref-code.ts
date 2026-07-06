import { encodeRef, decodeRef } from '../lib/ref/refCodec'

const [, , command, value] = process.argv
const secret = process.env.REF_CODE_SECRET

if (!secret) {
  console.error('REF_CODE_SECRET is not set. Add it to .env.local and run via:')
  console.error('  bun --env-file=.env.local scripts/ref-code.ts encode <tag>')
  process.exit(1)
}

if (!value || (command !== 'encode' && command !== 'decode')) {
  console.error('Usage: bun --env-file=.env.local scripts/ref-code.ts encode|decode <value>')
  console.error('  encode jane-2   -> opaque code for ?ref=')
  console.error('  decode <code>   -> original client tag')
  process.exit(1)
}

if (command === 'encode') {
  const code = encodeRef(value, secret)
  console.log(code)
  console.log(`https://trilliummassage.la/?ref=${code}`)
} else {
  console.log(decodeRef(value, secret))
}
