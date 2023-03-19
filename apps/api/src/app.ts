import "express-async-errors";
import cors from "cors";
import express, { type Express } from "express";
import { env } from "./lib/env";
import { start } from "./utils/start";
import { router } from "./router";
import helmet from "helmet";
import { usesentry } from "./lib/sentry";
import path from "path";

class App {
  private readonly app: Express;

  public port: number;

  constructor() {
    this.app = express();
    this.port = env.PORT;

    this.configure();
  }

  private configure() {
    this.app.set("view engine", "ejs");
    this.app.use(express.static(path.join(__dirname, "public")));
    this.app.set("trust proxy", true);
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: env.WEB_URL,
        credentials: true
      })
    );

    if (env.isProduction) usesentry(this.app);

    this.app.use(router);
  }

  public async serve() {
    return start({ app: this.app, port: this.port });
  }
}

export const app = new App();
