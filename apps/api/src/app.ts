import "express-async-errors";
import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import helmet from "helmet";
import { Sentry, usesentry } from "./lib/sentry";
import { CustomError, NotFoundError } from "@kamalyb/errors";
import { router as roomrouter } from "./modules/room/room.route";
import { useexplorer } from "mongoose-explorer";
import mongoose from "mongoose";
import cookiesession from "cookie-session";

export const app = express();

if (env.isProduction) usesentry(app);

app.set("view engine", "pug");
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

useexplorer({
  app,
  mongoose,
  rootpath: "/explorer",
  authorize: (req, res, next) => {
    if (!req.session?.pass) return res.redirect("/pass");

    next();
  }
});

app.get("/pass", (_req, res, _next) => {
  res.render("pass");
});

app.post("/pass", (req, res) => {
  const passkey = req.body.passkey as string;

  if (passkey !== env.PASS_KEY)
    return res.render("pass", { error: "incorrect pass key" });

  if (req.session) req.session.pass = true;

  res.redirect("/explorer");
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
