import { port, str, cleanEnv } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 2300 }),
  WEB_URL: str({ default: "http://localhost:3000" }),
  LISTEN_IP: str({ default: "0.0.0.0" }),
  ANNOUNCED_IP: str({ default: "127.0.0.1" }),
  SENTRY_DSN: str({ default: undefined }),
  MEDIASOUP_MIN_PORT: port({ default: 2000 }),
  MEDIASOUP_MAX_PORT: port({ default: 2020 }),
  NODE_ENV: str({
    choices: ["development", "production"] as const,
    default: "development"
  })
});
