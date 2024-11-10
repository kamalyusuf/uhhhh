import cron from "node-cron";
import { app } from "./app.js";
import { workers } from "./modules/mediasoup/workers.js";
import { logger } from "./lib/logger.js";
import { shutdown } from "./utils/shutdown.js";
import { env } from "./lib/env.js";
import { io } from "./modules/socket/io.js";
import { start } from "./utils/start.js";
import { MediasoupRoom } from "./modules/mediasoup/room.js";
import type { Server } from "node:http";

let server: Server;

const bootstrap = async () => {
  await workers.run();

  server = await start({ app, port: env.PORT });

  await io.initialize(server);

  cron.schedule("*/10 * * * *", MediasoupRoom.cleanup);

  logger.info(`api on http://localhost:${env.PORT}`);
};

bootstrap().catch((e) => {
  logger.error(e);

  process.exit(1);
});

["uncaughtException", "unhandledRejection"].forEach((signal) => {
  process.on(signal, (error: Error) => {
    logger.error(error);

    shutdown(server, 1);
  });
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    shutdown(server);
  });
});
