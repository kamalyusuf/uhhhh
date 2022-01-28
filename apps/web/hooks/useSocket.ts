import { useContext } from "react";
import { SocketContext } from "../modules/socket/SocketProvider";

export const useSocket = () => {
  const { socket } = useContext(SocketContext);

  return socket;
};
