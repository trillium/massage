export const qrColors = {
  teal: '#2dd4bf',
  slate: '#1f1f1f',
  golden: '#ffbd4a',
  white: '#ffffff',
} as const

export type QRColorPreset = 'default' | 'light' | 'dark'

export interface QRColorScheme {
  body: string
  background: string
  eyeFrame: string
  eyeBall: string
}

export const colorPresets: Record<QRColorPreset, QRColorScheme> = {
  default: {
    body: qrColors.teal,
    background: qrColors.slate,
    eyeFrame: qrColors.teal,
    eyeBall: qrColors.golden,
  },
  light: {
    body: qrColors.slate,
    background: qrColors.white,
    eyeFrame: qrColors.slate,
    eyeBall: qrColors.slate,
  },
  dark: {
    body: qrColors.white,
    background: qrColors.slate,
    eyeFrame: qrColors.white,
    eyeBall: qrColors.white,
  },
}
