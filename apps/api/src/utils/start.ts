import type { Express } from "express";
import type { Server } from "node:http";

export const start = ({
  app,
  port
}: {
  app: Express;
  port: number;
}): Promise<Server> =>
  new Promise<Server>((resolve, reject) => {
    const server = app.listen(port);

    server.on("listening", () => {
      resolve(server);
    });

    server.on("error", reject);
  });
