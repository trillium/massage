import { generateNativeQRSvg } from '@/lib/qr/generate-native'
import { colorPresets } from '@/lib/qr/colors'
import { siteConfig } from '@/lib/siteConfig'

export const HANDOUT_QR_CODE = 'DX01-handout'

export function handoutQrUrl(): string {
  return new URL(`rd/${HANDOUT_QR_CODE}`, siteConfig.domain.siteUrl).toString()
}

export async function handoutQrDataUri(): Promise<string> {
  const svg = await generateNativeQRSvg(handoutQrUrl(), colorPresets.light)
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
