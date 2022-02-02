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
  onError,
  notify = true
}: {
  socket: TypedSocket;
  event: T;
  data: Parameters<ClientToServerEvents[T]>[0];
  onError?: (error: { message: string; event: string }) => void;
  notify?: boolean;
  // @ts-ignore
}): Promise<Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]> => {
  // @ts-ignore
  return new Promise<Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]>(
    async (resolve, reject) => {
      if (!socket) {
        return reject(new Error("socket not initialized"));
      }

      if (!socket.connected) {
        return reject(new Error("socket not connected"));
      }

      socket.on("event error", (error) => {
        onError?.({ message: error.message, event: error.event });
        if (notify) {
          toast.error(error.message);
        }
        reject(error);
      });

      socket.emit(
        event,
        // @ts-ignore
        payload,
        // @ts-ignore
        (response: Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]) => {
          resolve(response);
        }
      );

      // try {
      //   socket.emit(
      //     event,
      //     // @ts-ignore
      //     payload,
      //     (response: Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]) => {
      //       console.log("on Cb", response);
      //       resolve(response);
      //     }
      //   );
      // } catch (e) {
      //   console.log("in request.catch block", { tt });
      //   if (tt) throw e;
      //   toast.error(`${e.message}`);
      // } finally {
      //   socket.off("event error");
      // }
    }
  ).finally(() => {
    socket.off("event error");
  });
};
