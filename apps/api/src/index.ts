import "colors";
import "./lib/misc";
import { Server } from "http";
import { _app } from "./app";
import { workers } from "./mediasoup/workers";
import { logger } from "./lib/logger";
import { exitHandler } from "./utils/exit-handler";

let server: Server;

const bootstrap = async () => {
  await workers.run();

  server = await _app.serve();
};

bootstrap().catch((e) => {
  console.log("bootstrap.error", e);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.log({
    level: "error",
    message: error as any,
    metadata: error
  });

  exitHandler(server);
});

process.on("unhandledRejection", (error: Error) => {
  logger.log({
    level: "error",
    message: error as any,
    metadata: error
  });

  exitHandler(server);
});

process.on("SIGTERM", () => {
  if (server) {
    server.close();
  }
});
