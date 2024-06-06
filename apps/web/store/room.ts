import type { EventError } from "types";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type State =
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
        state: "idle" as State,
        active_speakers: {} as Record<string, boolean>,
        error: undefined as string | EventError | undefined,
        warn_message: undefined as string | undefined,
        in_session_at: undefined as string | undefined
      },
      (set) => ({
        set,
        setstate: (state: State) => set({ state }),

        setactivespeaker: (peer_id: string, speaking: boolean) =>
          set((state) => {
            return {
              active_speakers: {
                ...state.active_speakers,
                [peer_id]: speaking
              }
            };
          }),

        reset: () =>
          set({
            state: "disconnected",
            active_speakers: {},
            error: undefined,
            warn_message: undefined,
            in_session_at: undefined
          })
      })
    ),
    { name: "Room" }
  )
);
