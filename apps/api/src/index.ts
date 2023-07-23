import "colors";
import "./utils/server-ip";
import { mongo } from "./lib/mongo";
import type { Server } from "http";
import { app } from "./app";
import { workers } from "./modules/mediasoup/workers";
import { logger } from "./lib/logger";
import { shutdown } from "./utils/shutdown";
import { env } from "./lib/env";
import { io } from "./modules/socket/io";
import { start } from "./utils/start";

let server: Server;

const bootstrap = async () => {
  await workers.run();

  await mongo.connect(env.MONGO_URL);

  server = await start({ app, port: env.PORT });

  io.initialize(server);
};

bootstrap().catch((e) => {
  logger.error(`bootstrap error. reason: ${e.message}`, e);

  process.exit(1);
});

["uncaughtException", "unhandledRejection"].forEach((signal) => {
  process.on(signal, (error: Error) => {
    logger.error(error, { capture: true });

    void shutdown(server, 1);
  });
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    void shutdown(server);
  });
});
