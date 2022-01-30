import { useContext } from "react";
import { SocketContext } from "../modules/socket/SocketProvider";

export const useSocket = () => {
  const { socket, state } = useContext(SocketContext);

  return { socket, state };
};
