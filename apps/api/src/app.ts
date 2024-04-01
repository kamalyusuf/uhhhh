import "express-async-errors";
import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import helmet from "helmet";
import { Sentry } from "./lib/sentry";
import {
  CustomError,
  JoiValidationError,
  NotFoundError
} from "@kamalyb/errors";
import { router as roomrouter } from "./modules/room/room.route";
import mongoose from "mongoose";
import cookiesession from "cookie-session";
import type Joi from "joi";
import { simplepass, usepass } from "express-simple-pass";
import { MongooseExplorer } from "mongoose-explore";
import { RoomProps } from "./modules/room/room.model";
import { MediasoupRoom } from "./modules/mediasoup/room";
import { shouldcapture } from "./utils/error";

export const app = express();

if (env.isProduction)
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

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.set("trust proxy", true);
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'unsafe-inline'"]
      }
    }
  })
);
app.use(cors({ origin: env.WEB_URL.split(",") }));
app.use(
  cookiesession({
    signed: false,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  })
);

app.get("/", (_req, res) => res.send({ ok: true }));

simplepass({
  app,
  passkey: env.PASS_KEY,
  redirect: "/explorer"
});

const explorer = new MongooseExplorer({
  mongoose,
  rootpath: "/explorer",
  resources: {
    Room: {
      properties: {
        password: {
          filterable: false,
          editable: false,
          renderers: {
            list: () => "✔️",
            view: () => "✔️"
          }
        }
      },
      virtuals: {
        members: (room: RoomProps) =>
          MediasoupRoom.findbyidsafe(
            room._id.toString()
          )?.members_count.toString() ?? "0"
      }
    }
  }
});

app.use(explorer.rootpath, usepass, explorer.router());

app.use("/api/rooms", roomrouter);

app.use((req, _res, next) => {
  next(new NotFoundError(`route: ${req.method} ${req.url} not found`));
});

app.use(Sentry.Handlers.errorHandler({ shouldHandleError: shouldcapture }));

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof CustomError)
      return res.status(error.status).send({ errors: error.serialize() });

    if ("details" in error) {
      const errors = [];

      for (const [, err] of (
        error.details as Map<string, Joi.ValidationError>
      ).entries())
        for (const e of new JoiValidationError(err.details).serialize())
          errors.push(e);

      return res.status(422).send({ errors });
    }

    res.status(500).send({
      errors: [
        {
          message: error.message
        }
      ]
    });
  }
);

require("express-list-routes")(app);
