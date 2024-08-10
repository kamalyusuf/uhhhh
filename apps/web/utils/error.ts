import { AxiosError } from "axios";
import type { ApiError, ErrorStatus } from "types";

export const parseapierror = (
  error: AxiosError<ApiError>
): {
  errors: ApiError["errors"];
  map: Record<string, string>;
  status?: ErrorStatus;
} => {
  if (!error.response?.data.errors)
    return {
      errors: [{ message: error.message }],
      map: {}
    };

  const errors = error.response.data.errors;

  return {
    errors,
    status: error.response.status as ErrorStatus,
    map: errors.reduce<Record<string, string>>((map, e) => {
      if (e.path) map[e.path] = e.message;
      return map;
    }, {})
  };
};
