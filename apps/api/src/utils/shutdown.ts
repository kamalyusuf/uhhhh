import { logger } from "../lib/logger.js";
import type { Server } from "node:http";

const closeserver = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) return reject(error);

      resolve();
    });
  });

export const shutdown = async (
  server?: Server,
  code: 0 | 1 = 0
): Promise<void> => {
  try {
    if (server) await closeserver(server);

    process.exit(code);
  } catch (e) {
    const error = e as Error;

    logger.error(`shutdown failed. reason: ${error.message}`, error);

    process.exit(1);
  }
};
