import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult
} from "@tanstack/react-query";
import type {
  ServerEvent,
  ClientToServerEvents
} from "../modules/socket/types";
import { useSocket } from "./use-socket";
import { request } from "../utils/request";
import type { EventError } from "types";
import type { ExtraQueryKeys, NoObj } from "../types";

type Fn = (...args: any) => any;

type Params<E extends ServerEvent> = Parameters<ClientToServerEvents[E]>;

type Return<K extends ServerEvent> = Params<K>[0] extends Fn
  ? Parameters<Params<K>[0]>[0]
  : Params<K>[1] extends Fn
  ? Parameters<Params<K>[1]>[0]
  : never;

interface Config<K extends ServerEvent> {
  event: K | [K, ...ExtraQueryKeys[]];
  payload: Params<K>[0] extends undefined | Fn ? NoObj : Params<K>[0];
  options?: Omit<UseQueryOptions<Return<K>>, "enabled"> & {
    _enabled?: boolean;
  };
}

export function useSocketQuery<K extends ServerEvent>(
  config: Config<K>
): UseQueryResult<Return<K>, EventError>;

export function useSocketQuery<K extends ServerEvent>(
  event: Config<K>["event"],
  payload: Config<K>["payload"],
  options?: Config<K>["options"]
): UseQueryResult<Return<K>, EventError>;

export function useSocketQuery<K extends ServerEvent>(
  arg: Config<K>["event"] | Config<K>,
  payload?: Config<K>["payload"],
  options?: Config<K>["options"]
) {
  const { socket, connected } = useSocket();

  let event: Config<K>["event"];
  let data: Config<K>["payload"];
  let opts: Config<K>["options"];

  const isConfig = typeof arg === "object" && !Array.isArray(arg);

  if (isConfig) {
    event = arg.event;
    data = arg.payload;
    opts = arg.options;
  } else {
    event = arg;
    data = payload;
    opts = options;
  }

  return useQuery<Return<K>, EventError>(
    Array.isArray(event) ? event : [event],
    () => {
      return request({
        socket,
        event: typeof event === "string" ? event : event[0],
        payload: data
      });
    },
    {
      enabled:
        typeof window !== "undefined" &&
        connected &&
        (typeof opts?._enabled === "undefined" ? true : opts?._enabled),
      ...(opts || {})
    }
  );
}
