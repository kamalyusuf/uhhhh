import { useQueryClient } from "@tanstack/react-query";
import { produce, type Draft } from "immer";
import { useCallback } from "react";
import type { ServerToClientEvents } from "../modules/socket/types";

type QueryKey = keyof ServerToClientEvents;

type QueryResult<T extends QueryKey> = Parameters<ServerToClientEvents[T]>[0];

export const useUpdateSocketQuery = () => {
  const client = useQueryClient();

  return useCallback(
    <T extends QueryKey>(
      key: T,
      updater: (draft: Draft<QueryResult<T>>) => void
    ) => {
      client.setQueryData<QueryResult<T>>([key], (cached) => {
        if (!cached) return undefined;

        return produce(cached, (draft) => {
          updater(draft);
        });
      });
    },
    [client]
  );
};
