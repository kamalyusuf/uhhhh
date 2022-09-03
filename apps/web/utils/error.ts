import { AxiosError } from "axios";
import { ApiError } from "types";

export const parse = (error?: AxiosError<ApiError>): string[] => {
  const errors = error?.response?.data?.errors;

  if (!errors) return ["something went wrong"];

  return errors.map((error) => error.message);
};
