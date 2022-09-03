import { io } from "socket.io-client";
import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  useRef
} from "react";
import { toast } from "react-toastify";
import type { TypedSocket } from "./types";
import { useMeStore } from "../../store/me";

type V = TypedSocket | null;

type SocketState = "idle" | "connected" | "error";

type Context = {
  socket: TypedSocket;
  setSocket: (socket: TypedSocket) => void;
  state: SocketState;
  connected: boolean;
};

export const SocketContext = createContext<Context>({
  socket: null,
  setSocket: () => {},
  state: "idle",
  connected: false
});

interface Props {}

export const SocketProvider = ({ children }: PropsWithChildren<Props>) => {
  const [socket, setSocket] = useState<V>(null);
  const { me } = useMeStore();
  const [state, setState] = useState<SocketState>("idle");
  const called = useRef(false);

  useEffect(() => {
    if (!socket && !!me && !called.current) {
      called.current = true;

      const s = io(process.env.NEXT_PUBLIC_API_URL, {
        rememberUpgrade: true,
        path: "/ws",
        autoConnect: true,
        reconnectionAttempts: 2,
        query: {
          user: JSON.stringify(me)
        },
        transports: ["websocket", "polling"]
      });

      setSocket(s);
    }
  }, [socket, me]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setState("connected");
    });

    socket.on("connect_error", (error) => {
      setState("error");

      toast.error(error.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={useMemo(
        () => ({ socket, setSocket, state, connected: state === "connected" }),
        [socket, state]
      )}
    >
      {children}
    </SocketContext.Provider>
  );
};
