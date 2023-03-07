import "colors";
import "./lib/ip";
import type { Server } from "http";
import { app } from "./app";
import { workers } from "./modules/mediasoup/workers";
import { logger } from "./lib/logger";
import { exithandler } from "./utils/exit-handler";
import { mongo } from "./lib/mongo";
import { env } from "./lib/env";
import { io } from "./modules/socket/io";

let server: Server;

const bootstrap = async () => {
  await workers.run();

  await mongo.connect(env.MONGO_URL);

  server = await app.serve();

  io.initialize(server);
};

bootstrap().catch((e) => {
  logger.error(`bootstrap error. reason: ${e.message}`, e);

  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error(error.message, error);

  exithandler(server);
});

process.on("unhandledRejection", (error: Error) => {
  logger.error(error.message, error);

  exithandler(server);
});

process.on("SIGTERM", () => {
  if (server) server.close();
});
