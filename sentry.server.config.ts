// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://e43b24fe499605bd22543b557f2f58fd@o4510984820555776.ingest.us.sentry.io/4510984837332992',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,
  enableLogs: true,
  enabled: process.env.NODE_ENV === 'production',
})
