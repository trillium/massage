function xorWithSecret(data: Buffer, secret: string): Buffer {
  const key = Buffer.from(secret, 'utf8')
  return Buffer.from(data.map((byte, i) => byte ^ key[i % key.length]))
}

export function encodeRef(tag: string, secret: string): string {
  if (!secret) throw new Error('refCodec: secret is required')
  return xorWithSecret(Buffer.from(tag, 'utf8'), secret).toString('base64url')
}

export function decodeRef(code: string, secret: string): string {
  if (!secret) throw new Error('refCodec: secret is required')
  return xorWithSecret(Buffer.from(code, 'base64url'), secret).toString('utf8')
}
