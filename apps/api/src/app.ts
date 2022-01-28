import "express-async-errors";
import cors from "cors";
import express, { Express } from "express";
import { Server } from "http";
import { env } from "./lib/env";
import { start } from "./lib/start";
import { router } from "./routes";
import * as mongo from "./lib/mongo";
import { io } from "./socket/io";

class App {
  private readonly _app: Express;
  public port: number;

  constructor() {
    this._app = express();
    this.port = env.PORT;

    this.configure();
  }

  get app() {
    return this._app;
  }

  private configure() {
    this._app.use(express.json());
    this._app.use(cors({ origin: [`${env.WEB_URL}`], credentials: true }));

    this._app.use(router);
  }

  public async serve(): Promise<Server> {
    await mongo.connect(env.MONGO_URL);
    const server = await start(this._app);

    io.init(server);

    return server;
  }
}

export const _app = new App();
