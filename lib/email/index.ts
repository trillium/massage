import type { SendMailParams } from '@/lib/types'
import type { SendMailOptions, Transporter } from 'nodemailer'
import { createTransport } from 'nodemailer'
import siteMetadata from '@/data/siteMetadata'
import { loadGoogleCredentials, loadGoogleOAuthApp } from '@/lib/google/credentials'

async function configureTransporter(): Promise<Transporter> {
  const app = await loadGoogleOAuthApp()
  if (!app) throw new Error('Google OAuth app not configured')

  return createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      clientId: app.client_id,
      clientSecret: app.client_secret,
    },
  })
}

async function sendMail({ to, subject, body }: SendMailParams): Promise<void> {
  const [transporter, creds] = await Promise.all([configureTransporter(), loadGoogleCredentials()])

  if (!creds?.refresh_token) throw new Error('No Google refresh token available')

  await transporter.sendMail({
    from: {
      address: siteMetadata.email,
      name: process.env.OWNER_NAME,
    },
    to,
    subject,
    html: body,
    auth: {
      user: siteMetadata.email,
      refreshToken: creds.refresh_token,
    },
  } as SendMailOptions & { auth: { user: string; refreshToken: string; accessToken?: string } })
}

export default sendMail
