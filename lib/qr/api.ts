import type { QRColorPreset, QRColorScheme } from './colors'
import { colorPresets, qrColors } from './colors'

const API_URL = 'https://api.qrcode-monkey.com/qr/custom'

interface QRMonkeyConfig {
  body: string
  eye: string
  eyeBall: string
  erf1: string[]
  erf2: string[]
  erf3: string[]
  brf1: string[]
  brf2: string[]
  brf3: string[]
  bodyColor: string
  bgColor: string
  eye1Color: string
  eye2Color: string
  eye3Color: string
  eyeBall1Color: string
  eyeBall2Color: string
  eyeBall3Color: string
  gradientColor1: string
  gradientColor2: string
  gradientType: string
  gradientOnEyes: boolean
  logo: string
  logoMode: string
}

interface QRMonkeyRequest {
  data: string
  config: QRMonkeyConfig
  size: number
  download: string
  file: string
}

function buildMonkeyConfig(scheme: QRColorScheme): QRMonkeyConfig {
  return {
    body: 'round',
    eye: 'frame2',
    eyeBall: 'ball2',
    erf1: ['fv'],
    erf2: [],
    erf3: [],
    brf1: ['fv'],
    brf2: [],
    brf3: [],
    bodyColor: scheme.body,
    bgColor: scheme.background,
    eye1Color: scheme.eyeFrame,
    eye2Color: scheme.eyeFrame,
    eye3Color: scheme.eyeFrame,
    eyeBall1Color: scheme.eyeBall,
    eyeBall2Color: scheme.eyeBall,
    eyeBall3Color: scheme.eyeBall,
    gradientColor1: '',
    gradientColor2: '',
    gradientType: 'linear',
    gradientOnEyes: false,
    logo: '',
    logoMode: 'default',
  }
}

export async function fetchQRCode(url: string, preset: QRColorPreset = 'default'): Promise<string> {
  const scheme = colorPresets[preset]
  const body: QRMonkeyRequest = {
    data: url,
    config: buildMonkeyConfig(scheme),
    size: 2000,
    download: 'imageUrl',
    file: 'svg',
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`QR Monkey API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.imageUrl) {
    throw new Error('QR Monkey API returned no imageUrl')
  }

  const svgResponse = await fetch(`https:${data.imageUrl}`)
  if (!svgResponse.ok) {
    throw new Error(`Failed to download SVG: ${svgResponse.status}`)
  }

  return svgResponse.text()
}
