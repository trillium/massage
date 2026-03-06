import type { Options } from 'qr-code-styling'
import type { QRColorScheme } from './colors'
import { colorPresets } from './colors'
import type { QRColorPreset } from './colors'

export function buildQROptions(
  data: string,
  colors?: QRColorScheme | QRColorPreset,
  overrides?: Partial<Options>
): Options {
  const scheme =
    typeof colors === 'string' ? colorPresets[colors] : (colors ?? colorPresets.default)

  return {
    width: 2000,
    height: 2000,
    type: 'svg',
    data,
    dotsOptions: {
      type: 'rounded',
      color: scheme.body,
    },
    cornersSquareOptions: {
      type: 'square',
      color: scheme.eyeFrame,
    },
    cornersDotOptions: {
      type: 'dot',
      color: scheme.eyeBall,
    },
    backgroundOptions: {
      color: scheme.background,
    },
    qrOptions: {
      errorCorrectionLevel: 'H',
    },
    ...overrides,
  }
}
