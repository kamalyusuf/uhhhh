import { type Express } from "express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { env } from "./env";

export { Sentry, Tracing };

export const usesentry = (app: Express) => {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app })
    ],
    tracesSampleRate: 1.0,
    environment: "production"
  });

  app.use(
    Sentry.Handlers.requestHandler({
      ip: true,
      user: true,
      request: true
    })
  );

  app.use(Sentry.Handlers.tracingHandler());
};
