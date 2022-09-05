import type { NextFunction, Request, Response } from "express";
import { CustomError } from "@kamalyb/errors";

export const useGlobalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CustomError)
    return res.status(error.status).send({ errors: error.serialize() });

  res.status(500).send({
    errors: [
      {
        message: error.message
      }
    ]
  });
};
