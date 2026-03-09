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
  containerBg: string
}

export const colorPresets: Record<QRColorPreset, QRColorScheme> = {
  default: {
    body: qrColors.teal,
    background: qrColors.slate,
    eyeFrame: qrColors.teal,
    eyeBall: qrColors.golden,
    containerBg: qrColors.teal,
  },
  light: {
    body: qrColors.slate,
    background: qrColors.white,
    eyeFrame: qrColors.slate,
    eyeBall: qrColors.slate,
    containerBg: qrColors.white,
  },
  dark: {
    body: qrColors.white,
    background: qrColors.slate,
    eyeFrame: qrColors.white,
    eyeBall: qrColors.white,
    containerBg: qrColors.slate,
  },
}
