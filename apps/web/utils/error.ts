import { AxiosError } from "axios";
import type { ApiError, ErrorProps, ErrorStatus } from "types";

export const parse = (
  error: AxiosError<ApiError>
): {
  messages: string[];
  map: Record<string, string>;
  errors: ErrorProps[];
  status: ErrorStatus;
} => {
  const errors = error?.response?.data.errors;
  const status = error?.response?.status as ErrorStatus;

  if (!errors || !errors?.length)
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
