import type { EventError } from "types";
import { createstore, type Set } from "../utils/store";

export type RoomState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "disconnecting"
  | "closed"
  | "error";

interface RoomStore {
  state: RoomState;
  active_speakers: Record<string, boolean>;
  error: string | EventError | null;
  warn_message: string | null;
  in_session_at: string | null;
  setactivespeaker: (peer_id: string, speaking: boolean) => void;
  reset: (state?: RoomState) => void;
  set: Set<RoomStore>;
}

export const useRoomStore = createstore<RoomStore>("Room", (set) => ({
  state: "idle",
  active_speakers: {},
  error: null,
  warn_message: null,
  in_session_at: null,
  set,

  setactivespeaker: (peer_id, speaking) =>
    set((state) => {
      return {
        active_speakers: {
          ...state.active_speakers,
          [peer_id]: speaking
        }
      };
    }),

  reset: (state) =>
    set({
      state: state ?? "disconnected",
      active_speakers: {},
      error: null,
      warn_message: null,
      in_session_at: null
    })
}));
