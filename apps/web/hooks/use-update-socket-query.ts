import { useQueryClient } from "@tanstack/react-query";
import type { ServerToClientEvents } from "../modules/socket/types";
import produce, { type Draft } from "immer";
import { useCallback } from "react";

type QueryKey = keyof ServerToClientEvents;

type QueryResult<T extends QueryKey> = Parameters<ServerToClientEvents[T]>[0];

export const useUpdateSocketQuery = () => {
  const client = useQueryClient();

  const fn = <T extends QueryKey>({
    key,
    updater
  }: {
    key: T;
    updater: (draft: Draft<QueryResult<T>>) => void;
  }) => {
    client.setQueryData<QueryResult<T>>([key], (cached) => {
      if (!cached) return undefined;

      return produce(cached, (draft) => {
        updater(draft);
      });
    });
  };

  return useCallback(fn, [client]);
};
