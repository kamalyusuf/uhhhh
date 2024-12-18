import { io } from "socket.io-client";
import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  type ReactNode,
  useContext
} from "react";
import { useUserStore } from "../../store/user";
import { toast } from "react-toastify";
import type { TypedSocket } from "./types";
import type { User } from "types";

type SocketState =
  | "idle"
  | "connected"
  | "error"
  | "disconnected"
  | "connecting";

type Context = {
  socket: TypedSocket | null;
  state: SocketState;
};

export const SocketContext = createContext<Context>({
  socket: null,
  state: "idle"
});

export const useSocket = () => useContext(SocketContext);

const connect = (me: User | null): Promise<TypedSocket> =>
  new Promise<TypedSocket>((resolve, reject) => {
    const socket: TypedSocket = io(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:2300",
      {
        rememberUpgrade: true,
        path: "/ws",
        autoConnect: true,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
        withCredentials: true,
        query: {
          "@me": JSON.stringify(me)
        }
      }
    );

    socket.on("connect", () => resolve(socket));

    socket.on("connect_error", reject);

    socket.io.on("error", reject);
  });

interface Props {
  children: ReactNode;
}

export const SocketProvider = ({ children }: Props) => {
  const [socket, setsocket] = useState<TypedSocket | null>(null);
  const user = useUserStore((state) => state.user);
  const [state, setstate] = useState<SocketState>("idle");
  const called = useRef(false);

  const load = useCallback(() => {
    setstate("connecting");

    connect(user)
      .then((s) => {
        setsocket(s);
        setstate("connected");
      })
      .catch((e) => {
        const error = e as Error;
        console.error(error);

        setstate("error");

        toast.error("failed to establish connection. try reloading the page", {
          autoClose: false
        });
      });
  }, [user]);

  useEffect(() => {
    if (user && !socket && !called.current) {
      called.current = true;

      load();
    }
  }, [user, socket, load]);

  useEffect(() => {
    if (!socket) return;

    socket.on("disconnect", () => setsocket(null));

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={useMemo(
        () => ({
          socket,
          state
        }),
        [socket, state]
      )}
    >
      {children}
    </SocketContext.Provider>
  );
};
