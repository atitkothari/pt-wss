// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3f989a5486cdb3838b6b1b9a63c84a3a@o4509878061236224.ingest.us.sentry.io/4509878062743552",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture user context
  beforeSend(event) {
    // Add custom context
    event.extra = {
      ...event.extra,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
    };
    return event;
  },

  // Set environment
  environment: process.env.NODE_ENV || "development",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;