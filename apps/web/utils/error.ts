import { AxiosError } from "axios";
import type { ApiError, ErrorStatus } from "types";

export const parseapierror = (error: AxiosError<ApiError>) => {
  const errors = error?.response?.data.errors;
  const status = error?.response?.status as ErrorStatus;

  if (!errors?.length)
    return {
      messages: [error?.message ?? "something went wrong"],
      map: {},
      errors,
      status
    };

  const map: Record<string, string> = {};

  errors.forEach((error) => {
    if (error.path) map[error.path] = error.message;
  });

  const messages = errors.map((e) => e.message);

  return {
    messages,
    map,
    errors,
    status
  };
};
