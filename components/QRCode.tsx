'use client'

import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import type { QRColorPreset } from '@/lib/qr/colors'
import { buildQROptions } from '@/lib/qr/config'

interface QRCodeProps {
  data: string
  preset?: QRColorPreset
  size?: number
  className?: string
}

export default function QRCode({ data, preset = 'default', size = 300, className }: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    const options = buildQROptions(data, preset, {
      width: size,
      height: size,
    })

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(options)
      if (containerRef.current) {
        qrRef.current.append(containerRef.current)
      }
    } else {
      qrRef.current.update(options)
    }
  }, [data, preset, size])

  return <div ref={containerRef} className={className} />
}
