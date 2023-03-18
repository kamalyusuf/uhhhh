import { useTimeElapsed } from "../../hooks/use-time-elapsed";
import { useRoomStore } from "../../store/room";

export const useRoomTimeElapsed = () => {
  const start = useRoomStore((state) => state.in_session_at);

  return useTimeElapsed(start ?? "").elapsed;
};
