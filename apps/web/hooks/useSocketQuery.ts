import { useQuery, UseQueryOptions } from "react-query";
import { ServerEvent, ClientToServerEvents } from "../modules/socket/types";
import { useSocket } from "./useSocket";
import { request } from "../lib/request";
import { isServer } from "../utils/is-server";

interface SocketError<T extends ServerEvent> {
  message: string;
  event: T;
}

export const useSocketQuery = <T extends ServerEvent>(
  event: T | [T, string],
  data: Parameters<ClientToServerEvents[T]>[0],
  options: Omit<
    UseQueryOptions<
      Parameters<Parameters<ClientToServerEvents[T]>[1]>[0],
      SocketError<T>
    >,
    "enabled"
  > & { e?: boolean } = {}
) => {
  const { socket } = useSocket();

  return useQuery<
    Parameters<Parameters<ClientToServerEvents[T]>[1]>[0],
    SocketError<T>
  >(
    event,
    () =>
      request({
        socket,
        event: typeof event === "string" ? event : event[0],
        data
      }),
    {
      enabled:
        !!socket &&
        !isServer() &&
        (typeof options.e === "undefined" ? true : options.e),
      ...options
    }
  );
};
