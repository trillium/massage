function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): Uint8Array {
  const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function xorWithSecret(data: Uint8Array, secret: string): Uint8Array {
  const key = new TextEncoder().encode(secret)
  return data.map((byte, i) => byte ^ key[i % key.length])
}

export function encodeRef(tag: string, secret: string): string {
  if (!secret) throw new Error('refCodec: secret is required')
  return toBase64Url(xorWithSecret(new TextEncoder().encode(tag), secret))
}

export function decodeRef(code: string, secret: string): string {
  if (!secret) throw new Error('refCodec: secret is required')
  return new TextDecoder().decode(xorWithSecret(fromBase64Url(code), secret))
}

export function tryDecodeRef(code: string, secret: string): string | null {
  try {
    const decoded = decodeRef(code, secret)
    return /^[\x20-\x7E]{2,64}$/.test(decoded) ? decoded : null
  } catch {
    return null
  }
}
