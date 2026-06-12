/* ds-ignore-file */
import type { OgImageData } from './types'

const BROWN = '#2c1810'
const CREAM = '#f5f0e8'

export function render({ title, bodyText, durations, discountLabel, domainLabel, eyebrow, tableImageSrc }: OgImageData) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: CREAM,
        padding: 20,
      }}
    >
      {/* Outer border frame */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          border: `4px solid ${BROWN}`,
          padding: 8,
        }}
      >
        {/* Inner border frame */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            border: `2px solid ${BROWN}`,
            overflow: 'hidden',
          }}
        >
          {/* Left: photo column */}
          <div style={{ display: 'flex', position: 'relative', flexShrink: 0 }}>
            {/* biome-ignore lint/performance/noImgElement: required for Satori ImageResponse — next/image not supported */}
            <img src={tableImageSrc} width={380} height={630} alt="" aria-hidden="true" />
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 380,
                height: 630,
                backgroundColor: 'rgba(180,120,60,0.3)',
              }}
            />
          </div>

          {/* Right: text column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              backgroundColor: CREAM,
              padding: '40px 44px',
              justifyContent: 'space-between',
            }}
          >
            {/* Top section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Eyebrow with flanking rules */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', width: 60, height: 2, backgroundColor: BROWN }} />
                <span
                  style={{
                    fontSize: 13,
                    letterSpacing: 4,
                    color: BROWN,
                    textTransform: 'uppercase',
                  }}
                >
                  — {eyebrow} —
                </span>
                <div style={{ display: 'flex', width: 60, height: 2, backgroundColor: BROWN }} />
              </div>

              {/* Title */}
              <div
                style={{
                  display: 'flex',
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: BROWN,
                  lineHeight: 1.05,
                  marginBottom: 20,
                }}
              >
                {title}
              </div>

              {/* Decorative rule */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: 1,
                  backgroundColor: BROWN,
                  marginBottom: 20,
                  opacity: 0.4,
                }}
              />

              {/* Body text */}
              {bodyText ? (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: BROWN,
                    lineHeight: 1.6,
                    opacity: 0.85,
                  }}
                >
                  {bodyText}
                </div>
              ) : null}
            </div>

            {/* Duration badges + discount */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {durations.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 12,
                    letterSpacing: 3,
                    color: BROWN,
                    textTransform: 'uppercase',
                    opacity: 0.6,
                    marginBottom: 4,
                  }}
                >
                  Choose your session
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {durations.map((m) => (
                  <div
                    key={m}
                    style={{
                      display: 'flex',
                      border: `1px solid ${BROWN}`,
                      padding: '8px 20px',
                      fontSize: 16,
                      letterSpacing: 2,
                      color: BROWN,
                      textTransform: 'uppercase',
                    }}
                  >
                    {m} min
                  </div>
                ))}
                {discountLabel ? (
                  <div
                    style={{
                      display: 'flex',
                      backgroundColor: BROWN,
                      color: CREAM,
                      padding: '8px 20px',
                      fontSize: 16,
                      letterSpacing: 2,
                      fontWeight: 700,
                    }}
                  >
                    {discountLabel}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Bottom: domain */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: 1,
                  backgroundColor: BROWN,
                  opacity: 0.3,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  letterSpacing: 3,
                  color: BROWN,
                  textTransform: 'uppercase',
                  opacity: 0.7,
                }}
              >
                {domainLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
