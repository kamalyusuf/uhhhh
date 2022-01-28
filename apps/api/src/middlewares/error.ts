import "colors";
import { NextFunction, Request, Response } from "express";
import { env } from "../lib/env";
import { CustomError } from "@kamalyb/errors";

export const useGlobalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CustomError) {
    return res.status(error.status).send({ errors: error.serialize() });
  }

  res.status(500).send({
    errors: [
      {
        message: env.isProduction ? "internal server error" : error.message
      }
    ]
  });
};
