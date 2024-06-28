import { AxiosError } from "axios";
import type { ApiError, ErrorStatus } from "types";

export const parseapierror = (
  error: AxiosError<ApiError>
): {
  errors: ApiError["errors"];
  map: Record<string, string>;
  messages: string[];
  status?: ErrorStatus;
} => {
  if (!error.response?.data.errors)
    return {
      errors: [{ message: error.message }],
      map: {},
      messages: [error.message],
      status: error.status as ErrorStatus
    };

  const errors = error.response.data.errors;

  const messages = errors.map((e) => e.message);

  return {
    messages,
    errors,
    status: error.response.status as ErrorStatus,
    map: errors.reduce<Record<string, string>>((map, e) => {
      if (e.path) map[e.path] = e.message;
      return map;
    }, {})
  };
};
