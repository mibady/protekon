import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://bad55b0cb867274a9dce4e46008a97d8@o4509557155561472.ingest.us.sentry.io/4511214496776192",
  tracesSampleRate: 0.1,
})
