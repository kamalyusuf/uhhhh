import { QueryClient } from "react-query";

export const queryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 60 * 1000 * 5,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      },
      mutations: {}
    }
  });
};
