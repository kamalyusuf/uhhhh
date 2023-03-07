import { toast } from "react-toastify";
import type { Fn, EmptyObject } from "types";
import type {
  ServerEvent,
  TypedSocket,
  ClientToServerEvents
} from "../modules/socket/types";

export type SocketRequestParams<T extends ServerEvent> = Parameters<
  ClientToServerEvents[T]
>;

export type SocketRequestResponse<T extends ServerEvent> =
  SocketRequestParams<T>[0] extends Fn
    ? Parameters<SocketRequestParams<T>[0]>[0]
    : SocketRequestParams<T>[1] extends Fn
    ? Parameters<SocketRequestParams<T>[1]>[0]
    : never;

interface Config<T extends ServerEvent> {
  socket: TypedSocket;
  event: T;
  data: SocketRequestParams<T>[0] extends undefined | Fn
    ? EmptyObject
    : SocketRequestParams<T>[0];
}

export const request = <T extends ServerEvent>({
  socket,
  event,
  data
}: Config<T>): Promise<SocketRequestResponse<T>> =>
  new Promise<SocketRequestResponse<T>>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("request timed out")),
      15000
    );

    socket.on("request error", (error) => {
      error.errors.forEach((e) => toast.error(e.message));

      clearTimeout(timer);

      reject(error);
    });

    socket.emit(
      event,
      // @ts-ignore
      { data, __request__: true },
      (response: SocketRequestResponse<T>) => {
        clearTimeout(timer);

        resolve(response);
      }
    );
  }).finally(() => socket.off("request error"));
