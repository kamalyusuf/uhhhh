import {
  Router,
  type Request,
  type Response,
  type NextFunction
} from "express";
import { CustomError, NotFoundError } from "@kamalyb/errors";
import { router as roomrouter } from "./modules/room/room.route";
import { Sentry } from "./lib/sentry";
import { env } from "./lib/env";

export const router = Router();

router.get(["/", "/api", "/health", "/api/health"], (_req, res) =>
  res.send({ ok: true })
);

router.use("/api/rooms", roomrouter);

router.use((_, __, ___) => {
  throw new NotFoundError("route not found");
});

if (env.SENTRY_DSN) router.use(Sentry.Handlers.errorHandler());

router.use(
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
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

require("express-list-routes")(router);
