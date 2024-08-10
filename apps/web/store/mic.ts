import { createstore } from "../utils/store";

const DEFAULT_MIC_ID_KEY = "default_mic_id";

interface MicStore {
  track: MediaStreamTrack | null;
  stream: MediaStream | null;
  id: string | null;
  settrack: (track: MediaStreamTrack) => void;
  setstream: (stream: MediaStream) => void;
  setdefaultmicid: (id: string) => void;
  reset: () => void;
}

export const useMicStore = createstore<MicStore>("Mic", (set) => ({
  id: initial(),
  track: null,
  stream: null,
  settrack: (track) => set({ track }),
  setstream: (stream) => set({ stream }),

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
}));

function initial(): string | null {
  try {
    return localStorage.getItem(DEFAULT_MIC_ID_KEY) ?? null;
  } catch {
    return null;
  }
}
