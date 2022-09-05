import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { api } from "./api";

export const defaultQueryFn: QueryFunction = async ({ queryKey }) =>
  await (
    await api.get(`${queryKey}`)
  ).data;

export const queryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        queryFn: defaultQueryFn,
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
};
