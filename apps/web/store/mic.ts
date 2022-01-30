import create from "zustand";
import { combine, devtools } from "zustand/middleware";

const store = combine(
  {
    track: null as MediaStreamTrack | null,
    stream: null as MediaStream | null
  },
  (set) => ({
    setTrack: (track: MediaStreamTrack) => set({ track }),
    setStream: (stream: MediaStream) => set({ stream }),
    reset: () =>
      set((state) => {
        state.track?.stop();

        return {
          track: null,
          stream: null
        };
      })
  })
);

export const useMicStore = create(devtools(store, { name: "MicStore" }));
