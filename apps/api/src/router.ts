import { Router } from "express";
import { NotFoundError } from "@kamalyb/errors";
import { router as roomrouter } from "./modules/room/room.route";
import { Sentry } from "./lib/sentry";
import { useglobalerrorhandler } from "./middlewares/error";

export const router = Router();

router.get(["/", "/api", "/health", "/api/health"], (_req, res) =>
  res.send({ ok: true, uptime: process.uptime() })
);

router.use("/api/rooms", roomrouter);

router.use(Sentry.Handlers.errorHandler());

router.use((_, __, ___) => {
  throw new NotFoundError("no route found");
});

router.use(useglobalerrorhandler);

require("express-list-routes")(router);
