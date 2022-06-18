import {
  ClientToServerEvents,
  ServerEvent,
  TypedSocket
} from "../modules/socket/types";
import { EventError } from "types";
import { toast } from "react-toastify";

type Fn = (...args: any) => any;

type P<E extends ServerEvent> = Parameters<ClientToServerEvents[E]>;

type Return<E extends ServerEvent> = P<E>[0] extends Fn
  ? Parameters<P<E>[0]>[0]
  : P<E>[1] extends Fn
  ? Parameters<P<E>[1]>[0]
  : never;

const parse = (error: EventError): string[] =>
  error.errors.map((e) => e.message);

export const request = async <E extends ServerEvent>({
  socket,
  event,
  payload
}: {
  socket: TypedSocket;
  event: E;
  payload: P<E>[0] extends undefined | Fn ? undefined : P<E>[0];
  onError?: (error: EventError) => void;
}): Promise<Return<E>> => {
  return new Promise<Return<E>>(async (resolve, reject) => {
    if (!socket) return reject(new Error("socket not initialized"));

    if (!socket.connected) return reject(new Error("socket not connected"));

    socket.on("event error", (error) => {
      const messages = parse(error);

      messages.forEach((message) => {
        toast.error(message);
      });

      reject(error);
    });

    console.log("[socket.request] emitting", { event, payload });

    // @ts-ignore
    socket.emit(event, payload, (response: Return<E>) => {
      resolve(response);
    });
  }).finally(() => {
    socket.off("event error");
  });
};
