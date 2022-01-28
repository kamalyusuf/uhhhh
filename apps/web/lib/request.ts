import {
  ClientToServerEvents,
  ServerEvent,
  TypedSocket
} from "../modules/socket/types";
import { toast } from "react-toastify";

/**
 *
 * @deprecated
 */
export const __request = async <T extends ServerEvent>({
  socket,
  event,
  data
}: {
  socket: TypedSocket;
  event: T;
  data: Parameters<ClientToServerEvents[T]>[0];
}): Promise<Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]> => {
  return new Promise((resolve, reject) => {
    socket.on("error", (error) => {
      toast.error(`${error.message}`);
      reject(error);
    });

    socket.emit(
      event,
      // @ts-ignore
      data,
      (response: Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]) => {
        resolve(response);
      }
    );
  });
};

export const request = async <T extends ServerEvent>({
  socket,
  event,
  data: payload,
  tt = false
}: {
  socket: TypedSocket;
  event: T;
  data: Parameters<ClientToServerEvents[T]>[0];
  tt?: boolean;
}): Promise<Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]> => {
  try {
    return await new Promise<
      Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]
    >((resolve, reject) => {
      socket.on("error", (error) => {
        reject(error);
      });

      socket.emit(
        event,
        // @ts-ignore
        payload,
        (response: Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]) => {
          resolve(response);
        }
      );
    });
  } catch (e) {
    if (tt) throw e;
    toast.error(`${e.message} on '${e.event}' event`);
  } finally {
    socket.off("error");
  }
};
