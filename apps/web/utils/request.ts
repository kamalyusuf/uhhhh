import type {
  ClientToServerEvents,
  ServerEvent,
  TypedSocket
} from "../modules/socket/types";
import { toast } from "react-toastify";
import type { NoObj } from "../types";
import { clearTimeout } from "timers";

type Fn = (...args: any) => any;

type Params<E extends ServerEvent> = Parameters<ClientToServerEvents[E]>;

type Return<E extends ServerEvent> = Params<E>[0] extends Fn
  ? Parameters<Params<E>[0]>[0]
  : Params<E>[1] extends Fn
  ? Parameters<Params<E>[1]>[0]
  : never;

export const request = async <E extends ServerEvent>({
  socket,
  event,
  payload
}: {
  socket: TypedSocket;
  event: E;
  payload: Params<E>[0] extends undefined | Fn ? NoObj : Params<E>[0];
}): Promise<Return<E>> => {
  if (!socket) throw new Error("socket not initialized");

  if (!socket.connected) throw new Error("socket not connected");

  return new Promise<Return<E>>(async (resolve, reject) => {
    socket.on("request error", (error) => {
      error.errors.forEach((e) => toast.error(e.message));

      reject(error);
    });

    console.info("[socket.request] emitting", { event, payload });

    socket.emit(
      event,
      // @ts-ignore
      { ...payload, __request__: true },
      (response: Return<E>) => {
        resolve(response);
      }
    );
  }).finally(() => {
    socket.off("request error");
  });
};
