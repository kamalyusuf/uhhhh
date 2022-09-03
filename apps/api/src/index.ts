import "colors";
import "./lib/misc";
import { Server } from "http";
import { app } from "./app";
import { workers } from "./mediasoup/workers";
import { logger } from "./lib/logger";
import { exitHandler } from "./utils/exit-handler";

let server: Server;

const bootstrap = async () => {
  await workers.run();

  server = await app.serve();
};

bootstrap().catch((e) => {
  logger.error(`bootstrap error. reason: ${e.message}`, e);

  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error(error.message, error);

  exitHandler(server);
});

process.on("unhandledRejection", (error: Error) => {
  logger.error(error.message, error);

  exitHandler(server);
});

process.on("SIGTERM", () => {
  if (server) server.close();
});
