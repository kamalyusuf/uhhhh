import { io } from "socket.io-client";
import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { TypedSocket } from "./types";
import { useMeStore } from "../../store/me";

type V = TypedSocket | null;

type Context = {
  socket: TypedSocket;
  setSocket: (socket: TypedSocket) => void;
};

export const SocketContext = React.createContext<Context>({
  socket: null,
  setSocket: () => {}
});

interface Props {
  connect: boolean;
}

export const SocketProvider = ({
  children,
  connect
}: PropsWithChildren<Props>) => {
  const [socket, setSocket] = useState<V>(null);
  const { me } = useMeStore();

  useEffect(() => {
    if (!socket && !!me && connect) {
      const s = io(process.env.NEXT_PUBLIC_API_URL, {
        rememberUpgrade: true,
        path: "/ws"
      });

      setSocket(s);
    }
  }, [socket, me, connect]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("connect", () => toast.info(`socket ${socket.id} connected`));

    return () => {
      socket.removeAllListeners();
      // socket.off("connect");
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={useMemo(() => ({ socket, setSocket }), [socket])}
    >
      {children}
    </SocketContext.Provider>
  );
};
