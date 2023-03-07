import axios, { AxiosError } from "axios";
import { parse } from "../utils/error";
import { toast } from "react-toastify";
import type { ApiError } from "types";

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  timeout: 10000,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const { messages } = parse(error);

    if (messages.length === 0) messages.push("something went wrong");

    messages.forEach((message) => toast.error(message));

    return Promise.reject(error);
  }
);
