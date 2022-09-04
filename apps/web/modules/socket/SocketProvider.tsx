import { io } from "socket.io-client";
import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback
} from "react";
import type { TypedSocket } from "./types";
import { useMeStore } from "../../store/me";
import type { User } from "types";

type V = TypedSocket | null;

type SocketState = "idle" | "connected" | "error" | "disconnected";

type Context = {
  socket: TypedSocket;
  state: SocketState;
  connected: boolean;
};

export const SocketContext = createContext<Context>({
  socket: null,
  state: "idle",
  connected: false
});

const connect = (me: User): Promise<TypedSocket> => {
  return new Promise<TypedSocket>((resolve, reject) => {
    const socket: TypedSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      rememberUpgrade: true,
      path: "/ws",
      autoConnect: true,
      reconnectionAttempts: 2,
      transports: ["websocket", "polling"],
      withCredentials: true,
      query: {
        user: JSON.stringify(me)
      }
    });

    socket.on("connect", () => resolve(socket));

    socket.on("connect_error", reject);

    socket.io.on("error", reject);

    socket.on("disconnect", () => {
      reject(new Error("socket disconnected"));
    });
  });
};

export const SocketProvider = ({ children }: PropsWithChildren<{}>) => {
  const [socket, setSocket] = useState<V>(null);
  const { me } = useMeStore();
  const [state, setState] = useState<SocketState>("idle");
  const called = useRef(false);

  const initialize = useCallback(async () => {
    try {
      const s = await connect(me);

      setSocket(s);
      setState("connected");
    } catch (e) {
      console.log(e);

      if (e.message === "socket disconnected") setState("disconnected");
      else setState("error");
    }
  }, [me]);

  useEffect(() => {
    if (!!me && !socket && !called.current) {
      called.current = true;

      initialize();
    }
  }, [me, socket, initialize]);

  useEffect(() => {
    if (!socket) return;

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={useMemo(
        () => ({ socket, state, connected: state === "connected" }),
        [socket, state]
      )}
    >
      {children}
    </SocketContext.Provider>
  );
};
