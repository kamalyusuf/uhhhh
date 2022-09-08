import { useTimeElapsed } from "../../hooks/use-time-elapsed";
import { useRoomStore } from "../../store/room";

export const useRoomTimeElapsed = () => {
  const start = useRoomStore((state) => state.in_session_at);
  const { elapsed } = useTimeElapsed(start);

  return elapsed;
};
