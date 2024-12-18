import hark from "hark";
import { useEffect } from "react";
import { useMicStore } from "../store/mic";
import { useSocket } from "../modules/socket/socket-provider";

export const useActiveSpeaker = () => {
  const { socket } = useSocket();
  const stream = useMicStore((state) => state.stream);

  useEffect(() => {
    if (!stream || !socket) return;

    const harker = hark(stream, { threshold: -65, interval: 75 });

    harker.on("speaking", () => {
      socket.emit("active speaker", { speaking: true });
    });

    harker.on("stopped_speaking", () => {
      socket.emit("active speaker", { speaking: false });
    });

    return () => {
      harker.stop();
    };
  }, [stream, socket]);

  return null;
};
