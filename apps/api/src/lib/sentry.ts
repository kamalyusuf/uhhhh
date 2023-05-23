import { type Express } from "express";
import * as Sentry from "@sentry/node";
import { env } from "./env";

export { Sentry };

export const usesentry = (app: Express) => {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new Sentry.Integrations.Mongo({
        useMongoose: true
      }),
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
    ],
    tracesSampleRate: 1.0,
    environment: env.NODE_ENV
  });

  app.use(
    Sentry.Handlers.requestHandler({
      request: true
    })
  );

  app.use(Sentry.Handlers.tracingHandler());
};
