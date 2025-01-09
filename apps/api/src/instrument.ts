import { init } from "@sentry/node";
import { env } from "./lib/env.js";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

if (env.SENTRY_DSN)
  init({
    dsn: env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0
  });
