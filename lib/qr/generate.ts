import { JSDOM } from 'jsdom'
import QRCodeStyling from 'qr-code-styling'
import type { QRColorPreset } from './colors'
import { buildQROptions } from './config'

export async function generateQRSvg(data: string, preset: QRColorPreset = 'default') {
  const options = buildQROptions(data, preset)

  const qr = new QRCodeStyling({
    jsdom: JSDOM,
    ...options,
  })

  const buffer = await qr.getRawData('svg')
  if (!buffer) throw new Error('Failed to generate QR SVG')

  return Buffer.isBuffer(buffer) ? buffer.toString('utf-8') : await buffer.text()
}

export async function generateQRBuffer(
  data: string,
  preset: QRColorPreset = 'default',
  format: 'svg' | 'png' = 'svg'
) {
  const options = buildQROptions(data, preset, {
    type: format === 'png' ? 'canvas' : 'svg',
  })

  const qr = new QRCodeStyling({
    jsdom: JSDOM,
    ...options,
  })

  const buffer = await qr.getRawData(format)
  if (!buffer) throw new Error(`Failed to generate QR ${format}`)

  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(await buffer.arrayBuffer())
}
