import { logger } from "./logger";
import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redis.on("connect", () => {
  logger.info("redis connected");
});

redis.on("error", (error: Error) => {
  logger.error(`redis connection failed. reason: ${error.message}`, error, {
    capture: true
  });

  process.exit(1);
});
