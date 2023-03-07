import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const key = "default_mic_id";

const initial = () => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
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
            localStorage.removeItem(key);

            return set({ id: "" });
          }

          try {
            localStorage.setItem(key, id);
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
