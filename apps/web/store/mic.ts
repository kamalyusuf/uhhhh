import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const DEFAULT_MIC_ID_KEY = "default_mic_id";

const initial = () => {
  try {
    return localStorage.getItem(DEFAULT_MIC_ID_KEY) ?? null;
  } catch {
    return null;
  }
};

export const useMicStore = create(
  devtools(
    combine(
      {
        track: null as MediaStreamTrack | null,
        stream: null as MediaStream | null,
        id: initial()
      },
      (set) => ({
        settrack: (track: MediaStreamTrack) => set({ track }),

        setstream: (stream: MediaStream) => set({ stream }),

        setdefaultmicid: (id: string) => {
          if (id === "-") {
            localStorage.removeItem(DEFAULT_MIC_ID_KEY);

            return set({ id: null });
          }

          try {
            localStorage.setItem(DEFAULT_MIC_ID_KEY, id);
          } catch {}

          set({ id });
        },

        reset: () =>
          set((state) => {
            state.track?.stop();

            return {
              track: null,
              stream: null
            };
          })
      })
    ),
    { name: "Mic" }
  )
);
