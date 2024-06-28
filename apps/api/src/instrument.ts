import { env } from "./lib/env";
import { Sentry } from "./lib/sentry";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

if (env.SENTRY_DSN)
  Sentry.init({
    dsn: env.SENTRY_DSN,
    integrations: [Sentry.httpIntegration(), nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: env.NODE_ENV
  });
