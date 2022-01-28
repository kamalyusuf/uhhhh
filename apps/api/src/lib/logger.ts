import winston, { format as f } from "winston";

const format = f.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const custom = f((info, _) => {
  // note to self: basically if we pass `dev: true` to logger.log({})
  // we will only log in dev mode
  if (info.dev as boolean) {
    return false;
  }

  return info;
});

const dev = winston.createLogger({
  format: f.combine(
    f.colorize({ all: true }),
    f.timestamp({
      format: "DD-MM-YYYY HH:mm:ss"
    }),
    f.errors({ stack: true }),
    format
  ),
  transports: [new winston.transports.Console()]
});

const prod = winston.createLogger({
  format: f.combine(
    f.timestamp({
      format: "DD-MM-YYYY HH:mm:ss"
    }),
    f.errors({ stack: true }),
    custom(),
    f.json()
  ),
  transports: [new winston.transports.Console()]
});

function build() {
  switch (
    process.env.NODE_ENV as "development" | "production" | "test" | undefined
  ) {
    case "development":
      return dev;
    case "production":
      return prod;
    case "test":
      return prod;
    default:
      return dev;
  }
}

export const logger = build();
