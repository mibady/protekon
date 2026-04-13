import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://bad55b0cb867274a9dce4e46008a97d8@o4509557155561472.ingest.us.sentry.io/4511214496776192",
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({ colorScheme: "system" }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
