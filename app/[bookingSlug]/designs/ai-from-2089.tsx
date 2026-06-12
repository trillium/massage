/* ds-ignore-file */
import type { OgImageData } from './types'

const BG = '#111111'
const GOLD = '#d4a843'
const TEXT = '#ffffff'
const MUTED = '#cccccc'
const MUTED_DIM = '#555555'

export function render({ title, bodyText, durations, discountLabel, domainLabel, eyebrow, tableImageSrc }: OgImageData) {
  const showPills = durations.length > 0

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: BG,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left content panel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: 820,
          height: 630,
          padding: '56px 60px',
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', width: 28, height: 2, background: GOLD, marginRight: 12 }} />
          <div
            style={{
              display: 'flex',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 4,
              color: GOLD,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* Body */}
        {bodyText ? (
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: MUTED,
              lineHeight: 1.5,
              marginBottom: 32,
            }}
          >
            {bodyText}
          </div>
        ) : null}

        {/* Pills + discount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          {showPills &&
            durations.map((m) => (
              <div
                key={m}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${GOLD}`,
                  color: GOLD,
                  fontSize: 20,
                  fontWeight: 600,
                  padding: '12px 28px',
                  letterSpacing: 1,
                }}
              >
                {m} min
              </div>
            ))}
          {discountLabel ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: GOLD,
                color: BG,
                fontSize: 20,
                fontWeight: 700,
                padding: '12px 28px',
              }}
            >
              {discountLabel}
            </div>
          ) : null}
        </div>

        {/* Domain */}
        <div style={{ display: 'flex', fontSize: 15, color: MUTED_DIM, letterSpacing: 2 }}>
          {domainLabel}
        </div>
      </div>

      {/* Photo — right side */}
      <div style={{ display: 'flex', width: 380, height: 630, position: 'relative' }}>
        {/* biome-ignore lint/performance/noImgElement: required for Satori ImageResponse — next/image not supported */}
        <img src={tableImageSrc} width={380} height={630} alt="" aria-hidden="true" />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 140,
            height: '100%',
            background: `linear-gradient(to right, ${BG} 0%, transparent 100%)`,
            display: 'flex',
          }}
        />
      </div>

      {/* Rainbow stripe at x=820 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          position: 'absolute',
          top: 0,
          left: 820,
          width: 12,
          height: 630,
        }}
      >
        <div style={{ display: 'flex', width: 2, height: 630, background: '#ff0000' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#ff8800' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#ffff00' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#00ff00' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#0088ff' }} />
        <div style={{ display: 'flex', width: 2, height: 630, background: '#8800ff' }} />
      </div>
    </div>
  )
}
