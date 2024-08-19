import type { AnyObject } from "types";
import winston, { format as f } from "winston";
import { env } from "./env.js";
import { CustomError } from "@kamalyb/errors";
import { captureException, captureMessage } from "@sentry/node";
import joi from "joi";

const format = f.printf(({ level, message, timestamp, stack, extra }) => {
  const log = `${timestamp} ${level}: ${message}`;

  const m = `${log}${extra ? `. ${JSON.stringify(extra)}` : ""}`;

  return stack ? `${m}\n${`${(stack as string).replace(/\n/, "")}`}` : m;
});

const exclude = f((info) => {
  if (info.skip) return false;

  return info;
});

const prodformat = f((info) => {
  if (info.dev) return false;

  Object.keys(info).forEach((key) => {
    if (!["level", "message"].includes(key)) delete info[key];
  });

  return info;
});

const dev = () =>
  winston.createLogger({
    format: f.combine(
      exclude(),
      f.colorize({ all: true }),
      f.timestamp({
        format: "DD-MM-YYYY HH:mm:ss"
      }),
      f.errors({ stack: true }),
      format
    ),
    transports: [new winston.transports.Console()]
  });

const prod = () =>
  winston.createLogger({
    format: f.combine(
      prodformat(),
      f.timestamp({
        format: "DD-MM-YYYY HH:mm:ss"
      }),
      f.json()
    ),
    transports: [new winston.transports.Console()]
  });

interface Options {
  extra?: AnyObject;
  force?: boolean;
}

class Logger {
  private output: winston.Logger;

  constructor() {
    this.output = env.isProduction ? prod() : dev();
  }

  info(
    message: string,
    {
      dev: d = false
    }: {
      dev?: boolean;
    } = {}
  ) {
    this.output.log({
      level: "info",
      message,
      dev: d
    });
  }

  warn(message: string, extra?: AnyObject) {
    if (env.SENTRY_DSN)
      captureMessage(message, {
        level: "warning",
        extra
      });

    this.output.log({
      level: "warn",
      message,
      extra,
      dev: true
    });
  }

  error(message: string, error: Error, o?: Options): void;
  error(error: Error, o?: Options): void;
  error(a: string | Error, b?: Error | Options, c?: Options) {
    const error = typeof a === "string" ? (b as Error) : a;
    const o = (typeof a === "string" ? c : b) as Options;
    const message = typeof a === "string" ? a : a.message;

    const report = !(error instanceof CustomError || joi.isError(error));

    if (report && env.SENTRY_DSN)
      captureException(error, {
        extra: {
          message,
          ...(o?.extra ?? {})
        }
      });

    this.output.log({
      level: "error",
      message,
      stack: typeof a === "string" ? (b as Error).stack : a.stack,
      dev: true,
      skip: !report,
      extra: o?.extra
    });
  }
}

export const logger = new Logger();
