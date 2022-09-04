import "./modules/deps";
import "express-async-errors";
import cors from "cors";
import express, { Express } from "express";
import { Server } from "http";
import { env } from "./lib/env";
import { start } from "./utils/start";
import { router } from "./routes";
import { mongo } from "./lib/mongo";
import { io } from "./modules/socket/io";
import helmet from "helmet";
import { useSentry } from "./lib/sentry";

class App {
  private readonly _app: Express;

  public port: number;

  constructor() {
    this._app = express();
    this.port = env.PORT;

    this.configure();
  }

  private configure() {
    this._app.disable("x-powered-by");
    this._app.set("trust proxy", 1);
    this._app.use(express.json());
    this._app.use(
      cors({
        origin: env.WEB_URL,
        credentials: true
      })
    );
    this._app.use(helmet());

    if (env.isProduction) useSentry(this._app);

    this._app.use(router);
  }

  public async serve(): Promise<Server> {
    await mongo.connect(env.MONGO_URL);

    const server = await start({ app: this._app, port: this.port });

    io.initialize(server);

    return server;
  }
}

export const app = new App();
