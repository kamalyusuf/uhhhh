import { Server } from "http";
import { Application } from "express";
import { env } from "./env";
import { logger } from "./logger";

export const start = async (app: Application): Promise<Server> =>
  new Promise<Server>((resolve, reject) => {
    const server = app.listen(env.PORT);

    server.on("listening", () => {
      logger.info(`app on http://localhost:${env.PORT}`.green);
      return resolve(server);
    });

    server.on("error", (error) => {
      return reject(error);
    });
  });
