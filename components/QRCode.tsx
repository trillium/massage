'use client'

import { useEffect, useRef } from 'react'
import type { QRColorPreset } from '../lib/qr/colors'
import { buildQROptions } from '../lib/qr/config'

interface QRCodeProps {
  data: string
  preset?: QRColorPreset
  size?: number
  className?: string
}

export default function QRCode({ data, preset = 'default', size = 200, className }: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<InstanceType<typeof import('qr-code-styling').default> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const options = buildQROptions(data, preset, { width: size, height: size })

    let cancelled = false

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (cancelled || !containerRef.current) return

      const qr = new QRCodeStyling(options)
      containerRef.current.innerHTML = ''
      qr.append(containerRef.current)
      qrRef.current = qr
    })

    return () => {
      cancelled = true
    }
  }, [data, preset, size])

  return <div ref={containerRef} className={className} />
}
