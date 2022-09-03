import { QueryClient, type QueryFunction } from "react-query";
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
        staleTime: 60 * 1000 * 5,
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
