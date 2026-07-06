const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const ZERO = BigInt(0)
const BYTE_SHIFT = BigInt(8)
const BYTE_MASK = BigInt(0xff)
const BASE = BigInt(62)

function toBase62(bytes: Uint8Array): string {
  let value = ZERO
  for (const byte of bytes) value = (value << BYTE_SHIFT) | BigInt(byte)
  let encoded = ''
  while (value > ZERO) {
    encoded = ALPHABET[Number(value % BASE)] + encoded
    value /= BASE
  }
  let leadingZeros = 0
  for (const byte of bytes) {
    if (byte !== 0) break
    leadingZeros++
  }
  return ALPHABET[0].repeat(leadingZeros) + encoded
}

function fromBase62(code: string): Uint8Array {
  let value = ZERO
  for (const char of code) {
    const index = ALPHABET.indexOf(char)
    if (index < 0) throw new Error(`refCodec: invalid character '${char}'`)
    value = value * BASE + BigInt(index)
  }
  const bytes: number[] = []
  while (value > ZERO) {
    bytes.unshift(Number(value & BYTE_MASK))
    value >>= BYTE_SHIFT
  }
  let leadingZeros = 0
  for (const char of code) {
    if (char !== ALPHABET[0]) break
    leadingZeros++
  }
  return Uint8Array.from([...new Array(leadingZeros).fill(0), ...bytes])
}

function xorWithSecret(data: Uint8Array, secret: string): Uint8Array {
  const key = new TextEncoder().encode(secret)
  return data.map((byte, i) => byte ^ key[i % key.length])
}

export function encodeRef(tag: string, secret: string): string {
  if (!secret) throw new Error('refCodec: secret is required')
  return toBase62(xorWithSecret(new TextEncoder().encode(tag), secret))
}

export function decodeRef(code: string, secret: string): string {
  if (!secret) throw new Error('refCodec: secret is required')
  return new TextDecoder().decode(xorWithSecret(fromBase62(code), secret))
}

export function tryDecodeRef(code: string, secret: string): string | null {
  try {
    const decoded = decodeRef(code, secret)
    return /^[\x20-\x7E]{2,64}$/.test(decoded) ? decoded : null
  } catch {
    return null
  }
}
