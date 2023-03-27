import { CustomError } from "@kamalyb/errors";
import consola from "consola";
import Joi from "joi";
import type { Anything, AnyObject } from "types";
import winston, { format as f } from "winston";
import { env } from "./env";
import { Sentry } from "./sentry";

const format = f.printf(({ level, message, timestamp, stack, extra }) => {
  const log = `${timestamp} ${level}: ${message}`;

  const m = `${log}${extra ? `. ${JSON.stringify(extra)}` : ""}`;

  return stack ? `${m}\n${`${(stack as string).replace(/\n/, "")}`.red}` : m;
});

const exclude = f((info) => {
  if (info.custom || info.joi) return false;

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
  capture?: boolean;
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

  cinfo(message: Anything, ...args: unknown[]) {
    if (env.isDevelopment)
      consola.info(
        typeof message === "string" ? `${message.blue}` : message,
        ...args
      );
  }

  cwarn(message: Anything, ...args: unknown[]) {
    if (env.isDevelopment)
      consola.info(
        typeof message === "string" ? `${message.yellow}` : message,
        ...args
      );
  }

  csuccess(message: Anything, ...args: unknown[]) {
    if (env.isDevelopment)
      consola.success(
        typeof message === "string" ? `${message.green}` : message,
        ...args
      );
  }

  warn(message: string, extra?: AnyObject) {
    if (env.SENTRY_DSN)
      Sentry.withScope((scope) => {
        scope.setLevel("warning");

        if (extra) scope.setExtras(extra);

        Sentry.captureMessage(message);
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
    const e = typeof a === "string" ? (b as Error) : a;
    const o = (typeof a === "string" ? c : b) as Options;

    if (o?.capture && env.SENTRY_DSN)
      Sentry.captureException(e, (scope) => {
        if (o?.extra) scope.setExtras(o.extra);

        return scope;
      });

    this.output.log({
      level: "error",
      message: typeof a === "string" ? a : a.message,
      stack: typeof a === "string" ? (b as Error).stack : a.stack,
      dev: true,
      custom: e instanceof CustomError,
      extra: o?.extra,
      joi: Joi.isError(e)
    });
  }
}

export const logger = new Logger();
