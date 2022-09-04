import create from "zustand";
import { combine, devtools } from "zustand/middleware";

type RoomState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "disconnecting"
  | "closed"
  | "error";

export const useRoomStore = create(
  devtools(
    combine(
      {
        state: "idle" as RoomState,
        active_speakers: {} as Record<string, boolean>,
        error_message: "",
        warn_message: ""
      },
      (set) => ({
        set,
        setState: (state: RoomState) => set({ state }),

        setActiveSpeaker: (peer_id: string, value: boolean) =>
          set((state) => {
            return {
              active_speakers: {
                ...state.active_speakers,
                [peer_id]: value
              }
            };
          }),

        reset: () =>
          set({
            state: "disconnected",
            active_speakers: {},
            error_message: "",
            warn_message: ""
          })
      })
    ),
    { name: "RoomStore" }
  )
);
