import * as envalid from "envalid";

export const env = envalid.cleanEnv(process.env, {
  PORT: envalid.port(),
  WEB_URL: envalid.str(),
  MONGO_URL: envalid.url(),
  LISTEN_IP: envalid.str(),
  ANNOUNCED_IP: envalid.str(),
  SENTRY_DSN: envalid.str({ devDefault: undefined }),
  NODE_ENV: envalid.str({ choices: ["development", "production"] as const }),
  MEDIASOUP_MIN_PORT: envalid.port(),
  MEDIASOUP_MAX_PORT: envalid.port()
});

console.log(env);
