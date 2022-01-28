import create from "zustand";
import { combine, devtools } from "zustand/middleware";

type RoomState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "closed";

const store = combine(
  {
    state: "new" as RoomState
  },
  (set) => ({
    setState: (state: RoomState) => set({ state })
  })
);

export const useRoomStore = create(devtools(store, { name: "RoomStore" }));
