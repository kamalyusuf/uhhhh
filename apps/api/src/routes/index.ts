import { Router } from "express";
import { useGlobalErrorHandler } from "../middlewares/error";
import { NotFoundError } from "@kamalyb/errors";
import { Sentry } from "../lib/sentry";
import { router as RoomRouter } from "../modules/room/room.route";

export const router = Router();

router.get(["/", "/api", "/health", "/api/health"], (_req, res) =>
  res.send({ ok: true })
);

router.use("/api/rooms", RoomRouter);

router.use(Sentry.Handlers.errorHandler());

router.use((_, __, ___) => {
  throw new NotFoundError("no route found");
});

router.use(useGlobalErrorHandler);

require("express-list-routes")(router);
