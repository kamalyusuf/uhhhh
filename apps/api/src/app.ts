import "express-async-errors";
import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import helmet from "helmet";
import { Sentry, usesentry } from "./lib/sentry";
import { CustomError, NotFoundError } from "@kamalyb/errors";
import { router as roomrouter } from "./modules/room/room.route";
import { useexplorer, usepass, usesimplepass } from "mongoose-explorer";
import mongoose from "mongoose";
import cookiesession from "cookie-session";

export const app = express();

if (env.isProduction) usesentry(app);

app.set("trust proxy", true);
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: false }));
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

usesimplepass({
  app,
  passkey: env.PASS_KEY,
  redirect_path: "/explorer"
});

useexplorer({
  app,
  mongoose,
  rootpath: "/explorer",
  authorize: usepass,
  models: {
    Room: {
      properties: {
        password: {
          isfilterable: false,
          iseditable: false
        },
        "creator._id": {
          iseditable: false
        },
        "creator.display_name": {
          iseditable: false
        }
      }
    }
  }
});

app.use("/api/rooms", roomrouter);

if (env.isProduction) app.use(Sentry.Handlers.errorHandler());

app.use((_req, _res, _next) => {
  throw new NotFoundError("route not found");
});

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof CustomError)
      return res.status(error.status).send({ errors: error.serialize() });

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
