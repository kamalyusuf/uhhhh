import { CustomError } from "@kamalyb/errors";
import joi from "joi";

export const shouldcapture = (error: Error) =>
  !(
    [
      "CastError",
      "DocumentNotFoundError",
      "ObjectExpectedError",
      "ObjectParameterError",
      "ValidationError"
    ].includes(error.name) ||
    error instanceof CustomError ||
    ("code" in error && error.code === 11000) ||
    joi.isError(error)
  );
