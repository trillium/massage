import jsQR from 'jsqr'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { colorPresets } from '@/lib/qr/colors'
import { generateNativeQRSvg } from '@/lib/qr/generate-native'
import { destinationForCode } from '@/lib/qr/scope-defaults'

import { PROPOSAL_TOKEN } from '../../proposalToken'
import { HANDOUT_QR_CODE, handoutQrUrl } from '../handoutQr'

async function decodeSvg(svg: string): Promise<string | undefined> {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(800, 800)
    .flatten({ background: '#ffffff' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data
}

describe('dental proposal handout QR', () => {
  it('encodes the /rd short link', async () => {
    const svg = await generateNativeQRSvg(handoutQrUrl(), colorPresets.light)
    expect(await decodeSvg(svg)).toBe(`https://trilliummassage.la/rd/${HANDOUT_QR_CODE}`)
  })

  it('does not embed the token in the QR', () => {
    expect(handoutQrUrl()).not.toContain(PROPOSAL_TOKEN)
  })

  it('redirects to the proposal page with its token', () => {
    expect(destinationForCode(HANDOUT_QR_CODE)).toBe(
      `https://trilliummassage.la/dental-exchange/proposal?token=${PROPOSAL_TOKEN}`
    )
  })
})
