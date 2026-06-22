/* ds-ignore-file */
interface InfoRow {
  label: string
  value: string | undefined | null
}

interface BuildEmailOpts {
  headerTitle: string
  preheader?: string
  infoRows?: InfoRow[]
  bodyContent?: string
  ctaHref?: string
  ctaLabel?: string
  secondaryCtaHref?: string
  secondaryCtaLabel?: string
  footerExtra?: string
}

export function buildEmailHtml(opts: BuildEmailOpts): string {
  const {
    headerTitle,
    preheader,
    infoRows,
    bodyContent,
    ctaHref,
    ctaLabel,
    secondaryCtaHref,
    secondaryCtaLabel,
    footerExtra,
  } = opts

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${preheader}&nbsp;</div>`
    : ''

  const LOGO_URL = 'https://trilliummassage.la/static/images/logo-email.png'
  const headerHtml = `<tr><td style="background-color:#dc2626;padding:20px 32px 16px;text-align:center"><table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px"><tr><td style="background-color:#ffffff;border-radius:50%;width:88px;height:88px;border:3px solid rgba(255,255,255,0.5);overflow:hidden"><img src="${LOGO_URL}" alt="Trillium Massage" width="68" height="68" style="display:block;margin:15px 0 0 15px" /></td></tr></table><h1 style="margin:0;color:#ffffff;font-family:Arial,sans-serif;font-size:22px;font-weight:700">${headerTitle}</h1></td></tr>`

  const truthyRows = (infoRows ?? []).filter(
    (row) => row.value !== undefined && row.value !== null && row.value !== ''
  )

  let infoCardHtml = ''
  if (truthyRows.length > 0) {
    const rowsHtml = truthyRows
      .map(
        (row) =>
          `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;width:120px;vertical-align:top">${row.label}</td><td style="font-family:Arial,sans-serif;font-size:14px;color:#111827;vertical-align:top">${row.value}</td></tr>`
      )
      .join('')
    infoCardHtml = `<tr><td style="padding:24px 32px"><table width="100%" cellpadding="8" cellspacing="0" border="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px">${rowsHtml}</table></td></tr>`
  }

  const bodyHtml = bodyContent
    ? `<tr><td style="padding:0 32px 24px;font-family:Arial,sans-serif;font-size:14px;color:#374151;line-height:1.6">${bodyContent}</td></tr>`
    : ''

  const ctaHtml =
    ctaHref && ctaLabel
      ? `<tr><td style="padding:0 32px 20px;text-align:center"><table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr><td style="background-color:#dc2626;border-radius:6px;padding:12px 28px"><a href="${ctaHref}" style="font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;display:block">${ctaLabel}</a></td></tr></table></td></tr>`
      : ''

  const secondaryCtaHtml =
    secondaryCtaHref && secondaryCtaLabel
      ? `<tr><td style="padding:0 32px 20px;text-align:center"><table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr><td style="background-color:#ffffff;border:2px solid #dc2626;border-radius:6px;padding:12px 28px"><a href="${secondaryCtaHref}" style="font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#dc2626;text-decoration:none;display:block">${secondaryCtaLabel}</a></td></tr></table></td></tr>`
      : ''

  const footerExtraHtml = footerExtra
    ? `<tr><td style="padding:0 32px 24px">${footerExtra}</td></tr>`
    : ''

  const footerHtml = `<tr><td style="background-color:#f9fafb;padding:20px 32px;text-align:center"><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280">Trillium Massage · 1-818-738-5344 · <a href="https://trilliummassage.la" style="color:#dc2626;text-decoration:none">trilliummassage.la</a></p></td></tr>`

  return `${preheaderHtml}<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:24px 0"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden">${headerHtml}${infoCardHtml}${bodyHtml}${ctaHtml}${secondaryCtaHtml}${footerExtraHtml}${footerHtml}</table></td></tr></table>`
}
