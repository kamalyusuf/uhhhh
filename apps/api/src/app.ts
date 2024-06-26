import "express-async-errors";
import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import helmet from "helmet";
import { Sentry } from "./lib/sentry";
import { CustomError, NotFoundError } from "@kamalyb/errors";
import { router as roomrouter } from "./modules/room/room.route";

export const app = express();

app.set("trust proxy", true);
app.use(express.json({ limit: "500kb" }));
app.use(helmet());
app.use(cors({ origin: env.WEB_URL.split(",") }));

app.get("/", (_req, res) => res.send({ ok: true }));

app.use("/api/rooms", roomrouter);

app.use((req, _res, next) => {
  next(new NotFoundError(`route: ${req.method} ${req.url} not found`));
});

Sentry.setupExpressErrorHandler(app);

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
