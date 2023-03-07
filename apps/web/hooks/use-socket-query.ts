import {
  type SocketRequestResponse,
  type SocketRequestParams,
  request
} from "../utils/request";
import type { Fn, EventError as SocketEventError } from "types";
import type { ServerEvent } from "../modules/socket/types";
import {
  UseQueryResult,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query";
import type { ExtraQueryKeys } from "../types";
import { useSocket } from "./use-socket";

type Params<T extends ServerEvent> = SocketRequestParams<T>[0] extends
  | undefined
  | Fn
  ? never
  : SocketRequestParams<T>[0];

type Options<T extends ServerEvent> = UseQueryOptions<
  SocketRequestResponse<T>,
  SocketEventError
>;

export const useSocketQuery = <T extends ServerEvent>(
  ...args: Params<T> extends never
    ? [key: T | [T, ...ExtraQueryKeys], options?: Options<T>]
    : [
        key: T | [T, ...ExtraQueryKeys],
        params: [Params<T>],
        options?: Options<T>
      ]
): UseQueryResult<SocketRequestResponse<T>, SocketEventError> => {
  const { socket, state } = useSocket();

  const key = args[0];
  const data =
    args[1] && Array.isArray(args[1])
      ? args[1][0]
      : ({} as Parameters<typeof request<T>>[0]["data"]);
  const options = args[1] && !Array.isArray(args[1]) ? args[1] : args[2];

  const enabled = options?.enabled ?? true;

  delete options?.enabled;

  return useQuery<SocketRequestResponse<T>, SocketEventError>(
    Array.isArray(key) ? key : [key],
    () => {
      if (!socket) throw new Error("socket not initialized");

      if (!socket.connected) throw new Error("socket not connected");

      return request({
        socket,
        event: typeof key === "string" ? key : key[0],
        data
      });
    },
    {
      enabled:
        typeof window !== "undefined" && state === "connected" && enabled,
      ...(options || {})
    }
  );
};
