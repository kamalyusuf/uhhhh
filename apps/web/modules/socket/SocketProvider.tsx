import { io } from "socket.io-client";
import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { TypedSocket } from "./types";
import { useMeStore } from "../../store/me";

type V = TypedSocket | null;

type SocketState = "idle" | "connected" | "connecting" | "error";

type Context = {
  socket: TypedSocket;
  setSocket: (socket: TypedSocket) => void;
  state: SocketState;
};

export const SocketContext = React.createContext<Context>({
  socket: null,
  setSocket: () => {},
  state: "idle"
});

interface Props {
  connect: boolean;
}

export const SocketProvider = ({ children }: PropsWithChildren<Props>) => {
  const [socket, setSocket] = useState<V>(null);
  const { me } = useMeStore();
  const [state, setState] = useState<SocketState>("idle");

  useEffect(() => {
    if (!socket && !!me) {
      setState("connecting");

      const s = io(process.env.NEXT_PUBLIC_API_URL, {
        rememberUpgrade: true,
        path: "/ws",
        autoConnect: true,
        reconnectionAttempts: 2,
        query: {
          user: JSON.stringify(me)
        }
      });

      setSocket(s);
    }
  }, [socket, me]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("connect", () => {
      setState("connected");
    });

    socket.on("connect_error", (error) => {
      setState("error");
      toast.error(error.message);
    });

    socket.on("error", (error) => {
      toast.error(error.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={useMemo(() => ({ socket, setSocket, state }), [socket, state])}
    >
      {children}
    </SocketContext.Provider>
  );
};
