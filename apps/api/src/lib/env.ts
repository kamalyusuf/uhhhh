import { port, str, url, cleanEnv } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port(),
  WEB_URL: str(),
  MONGO_URL: url(),
  LISTEN_IP: str(),
  ANNOUNCED_IP: str(),
  SENTRY_DSN: str({ devDefault: undefined }),
  MEDIASOUP_MIN_PORT: port(),
  MEDIASOUP_MAX_PORT: port(),
  NODE_ENV: str({
    choices: ["development", "production"] as const,
    default: "development"
  }),
	PASS_KEY: str()
});

console.log(env);
