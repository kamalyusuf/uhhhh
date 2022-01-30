import {
  ClientToServerEvents,
  ServerEvent,
  TypedSocket
} from "../modules/socket/types";
import { toast } from "react-toastify";

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
  return new Promise<Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]>(
    async (resolve, reject) => {
      if (!socket) {
        return reject(new Error("socket not initialized"));
      }

      if (!socket.connected) {
        return reject(new Error("socket not connected"));
      }

      socket.on("error", (error) => {
        reject(error);
      });

      try {
        socket.emit(
          event,
          // @ts-ignore
          payload,
          (response: Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]) => {
            resolve(response);
          }
        );
      } catch (e) {
        if (tt) throw e;
        toast.error(`${e.message}`);
      } finally {
        socket.off("error");
      }
    }
  );
};
