import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import listroutes from "express-list-routes";
import { env } from "./lib/env.js";
import { CustomError, NotFoundError } from "@kamalyb/errors";
import { router as roomrouter } from "./modules/room/room.route.js";
import { setupExpressErrorHandler } from "@sentry/node";

export const app = express();

app.set("trust proxy", true);
app.use(express.json({ limit: "500kb" }));
app.use(helmet());
app.use(cors({ origin: env.WEB_URL.split(",") }));

app.get(
  ["/", "/health", "/api/health"],
  (_req, res) => void res.send({ ok: true, uptime: process.uptime() })
);

app.use("/api/rooms", roomrouter);

app.use((req, _res, next) => {
  next(new NotFoundError(`route: ${req.method} ${req.url} not found`));
});

setupExpressErrorHandler(app);

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof CustomError)
      return void res.status(error.status).send({ errors: error.serialize() });

    res.status(500).send({
      errors: [
        {
          message: error.message
        }
      ]
    });
  }
);

listroutes(app, { spacer: 6 });
