import { CustomError } from "@kamalyb/errors";
import _ from "lodash";
import mongoose from "mongoose";
import { env } from "./env";
import { ServerEvent } from "../socket/types";

export const msg = (param: any): string => {
  if (typeof param === "string") {
    return param;
  }

  if (!Array.isArray(param)) {
    return param.message;
  }

  const p = param[0];

  return typeof p === "string" ? p : p.message;
};

const type = (error: any) => {
  const isUniqueError = error.kind === "unique";
  const isRequiredError = error.kind === "required";
  const isCastError = (error.message as string).startsWith("Cast");
  const isStrictModeError = error.name === "StrictModeError";
  const isEnumError = error.kind === "enum";

  return {
    isUniqueError,
    isRequiredError,
    isCastError,
    isStrictModeError,
    isEnumError
  };
};

export class EventError {
  public message: string;

  constructor(public event: ServerEvent, error: any) {
    if (error.name === "BSONTypeError") {
      this.message = `expected id to be a valid mongo id`;
      return;
    }

    if (error instanceof CustomError) {
      this.message = msg(error);
      return;
    }

    if (error instanceof mongoose.Error) {
      const e = error as any;
      const Errors = e.errors;

      if (!Errors || _.isEmpty(Errors)) {
        const {
          isUniqueError,
          isRequiredError,
          isCastError,
          isStrictModeError,
          isEnumError
        } = type(e);

        this.message = isStrictModeError
          ? env.isProduction
            ? "internal server error"
            : e.message
          : isUniqueError
          ? e.message
          : isCastError
          ? e.kind
            ? `expected ${e.path} to be of type ${e.kind}`
            : "invalid data type"
          : isRequiredError
          ? e.message ?? `${e.path} is required`
          : isEnumError
          ? `expected ${e.path} to be one of ${e.properties?.enumValues?.join(
              ", "
            )}`
          : e.message;
      } else {
        const errors = Object.values(Errors).map((e: any) => {
          const {
            isUniqueError,
            isRequiredError,
            isCastError,
            isStrictModeError,
            isEnumError
          } = type(e);

          if (isStrictModeError) {
            return env.isProduction ? "internal server error" : e.message;
          }

          return isUniqueError
            ? e.message
            : isCastError
            ? e.kind
              ? `expected ${e.path} to be of type ${e.kind}`
              : "invalid data type"
            : isRequiredError
            ? e.message ?? `${e.path} is required`
            : isEnumError
            ? `expected ${e.path} to be one of ${e.properties.enumValues.join(
                ", "
              )}`
            : e.message;
        });

        this.message = errors[0];
      }
      return;
    }

    this.message = env.isProduction ? "internal server error" : error.message;
  }
}
