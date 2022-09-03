import { useQuery, UseQueryOptions } from "react-query";
import type {
  ServerEvent,
  ClientToServerEvents
} from "../modules/socket/types";
import { useSocket } from "./use-socket";
import { request } from "../utils/request";
import type { EventError } from "types";

type Fn = (...args: any) => any;

type P<E extends ServerEvent> = Parameters<ClientToServerEvents[E]>;

type Return<K extends ServerEvent> = P<K>[0] extends Fn
  ? Parameters<P<K>[0]>[0]
  : P<K>[1] extends Fn
  ? Parameters<P<K>[1]>[0]
  : void;

export const useSocketQuery = <K extends ServerEvent>(
  event: K | [K, ...string[]],
  payload: P<K>[0] extends undefined | Fn ? undefined : P<K>[0],
  options: Omit<UseQueryOptions<Return<K>>, "enabled"> & { e?: boolean } = {}
) => {
  const { socket } = useSocket();

  return useQuery<Return<K>, EventError>(
    event,
    () =>
      request({
        socket,
        event: typeof event === "string" ? event : event[0],
        payload
      }),
    {
      enabled:
        !!socket &&
        typeof window !== "undefined" &&
        (typeof options.e === "undefined" ? true : options.e),
      ...options
    }
  );
};
