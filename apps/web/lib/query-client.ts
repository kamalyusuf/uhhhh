import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { api } from "./api";

const defaultqueryfn: QueryFunction = async ({ queryKey }) =>
  await (
    await api.get(`${queryKey}`)
  ).data;

export const createqueryclient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        queryFn: defaultqueryfn,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retryOnMount: false,
        refetchOnMount: false
      },
      mutations: {
        retry: false
      }
    }
  });
