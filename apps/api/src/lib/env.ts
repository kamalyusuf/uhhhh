import * as envalid from "envalid";

export interface Env {
  PORT: number;
  WEB_URL: string;
  MONGO_URL: string;
  LISTEN_IP: string;
  ANNOUNCED_IP: string;
  SENTRY_DSN?: string;
  NODE_ENV: string;
  MEDIASOUP_MIN_PORT: number;
  MEDIASOUP_MAX_PORT: number;
  REDIS_URL: string;
}

export const env = envalid.cleanEnv<Env>(process.env, {
  PORT: envalid.port(),
  WEB_URL: envalid.str(),
  MONGO_URL: envalid.url(),
  LISTEN_IP: envalid.str(),
  ANNOUNCED_IP: envalid.str(),
  SENTRY_DSN: envalid.str({ devDefault: undefined }),
  NODE_ENV: envalid.str({ choices: ["development", "production"] }),
  MEDIASOUP_MIN_PORT: envalid.port(),
  MEDIASOUP_MAX_PORT: envalid.port(),
  REDIS_URL: envalid.url({ devDefault: "redis://localhost:6379" })
});

console.log(env);
