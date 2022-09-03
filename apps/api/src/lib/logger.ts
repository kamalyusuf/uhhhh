import { CustomError } from "@kamalyb/errors";
import consola from "consola";
import winston, { format as f } from "winston";
import { env } from "./env";
import { Sentry } from "./sentry";

type Extra = Record<string, any>;

const format = f.printf(({ level, message, timestamp, stack, extra }) => {
  const log = `${timestamp} ${level}: ${message}`;

  const m = `${log}${extra ? `. ${JSON.stringify(extra)}` : ""}`;

  return stack ? `${m}\n${`${(stack as string).replace(/\n/, "")}`.red}` : m;
});

const exclude = f((info) => {
  if (info.custom || info.validation) return false;

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
      f((info) => {
        if (info.dev || info.test) return false;

        Object.keys(info).forEach((key) => {
          if (!["level", "message"].includes(key)) delete info[key];
        });

        return info;
      })(),
      f.timestamp({
        format: "DD-MM-YYYY HH:mm:ss"
      }),
      f.json()
    ),
    transports: [new winston.transports.Console()]
  });

class Logger {
  private _output: winston.Logger;

  constructor() {
    this._output = env.isProduction ? prod() : dev();
  }

  info(
    message: string,
    {
      dev: d = false
    }: {
      dev?: boolean;
    } = {}
  ) {
    this._output.log({
      level: "info",
      message,
      dev: d,
      test: env.isTest
    });
  }

  cinfo(message: string | object, ...args: any[]) {
    if (env.isDevelopment)
      consola.info(
        typeof message === "string" ? `${message.blue}` : message,
        ...args
      );
  }

  cwarn(message: string | object, ...args: any[]) {
    if (env.isDevelopment)
      consola.info(
        typeof message === "string" ? `${message.yellow}` : message,
        ...args
      );
  }

  csuccess(message: string | object, ...args: any[]) {
    if (env.isDevelopment)
      consola.success(
        typeof message === "string" ? `${message.green}` : message,
        ...args
      );
  }

  warn(message: string, extra?: Extra) {
    if (env.isProduction)
      Sentry.withScope((scope) => {
        scope.setLevel("warning");

        if (extra) scope.setExtras(extra);

        Sentry.captureMessage(message);
      });

    this._output.log({
      level: "warn",
      message,
      extra,
      dev: true
    });
  }

  error(
    message: string,
    error: Error | CustomError,
    o?: {
      capture?: boolean;
      extra?: { [key: string]: any };
      force?: boolean;
    }
  ) {
    if (o?.capture && env.isProduction)
      Sentry.captureException(error, (scope) => {
        if (o?.extra) scope.setExtras(o.extra);

        return scope;
      });

    this._output.log({
      level: "error",
      message,
      stack: error.stack,
      dev: true,
      custom: error instanceof CustomError,
      validation: error.name === "ValidationError",
      extra: o?.extra
    });
  }
}

export const logger = new Logger();
