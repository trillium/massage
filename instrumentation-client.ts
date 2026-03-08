import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://e43b24fe499605bd22543b557f2f58fd@o4510984820555776.ingest.us.sentry.io/4510984837332992',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  enabled: process.env.NODE_ENV === 'production',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
