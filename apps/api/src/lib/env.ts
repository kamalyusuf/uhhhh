import * as envalid from "envalid";

export interface Env {
  PORT: number;
  WEB_URL: string;
  MONGO_URL: string;
}

export const env = envalid.cleanEnv<Env>(process.env, {
  PORT: envalid.port(),
  WEB_URL: envalid.str(),
  MONGO_URL:
    process.env.NODE_ENV === "production" ? envalid.url() : envalid.str()
});
