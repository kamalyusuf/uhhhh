import { Router } from "express";
import { useGlobalErrorHandler } from "../middlewares/error";
import { NotFoundError } from "@kamalyb/errors";
import { Sentry } from "../lib/sentry";

export const router = Router();

router.get(["/", "/api", "/health", "/api/health"], (_req, res) =>
  res.send({ ok: true })
);

router.use(Sentry.Handlers.errorHandler());

router.use((_, __, ___) => {
  throw new NotFoundError("no route found");
});

router.use(useGlobalErrorHandler);

require("express-list-routes")(router);
