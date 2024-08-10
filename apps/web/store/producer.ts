import type { Producer } from "mediasoup-client/lib/types";
import { createstore, type Set } from "../utils/store";

interface ProducerStore {
  producer: Producer | null;
  paused: boolean;
  add: (producer: Producer) => void;
  setpaused: (paused: boolean) => void;
  remove: () => void;
  reset: () => void;
  set: Set<ProducerStore>;
}

export const useProducerStore = createstore<ProducerStore>(
  "Producer",
  (set) => ({
    producer: null,
    paused: false,
    set,
    add: (producer) =>
      set((state) => {
        if (state.producer && !state.producer.closed) state.producer.close();

        return { producer };
      }),

    setpaused: (paused) => set({ paused }),
    remove: () => set({ producer: null, paused: false }),

    reset: () =>
      set((state) => {
        state.producer?.close();

        return { producer: null, paused: false };
      })
  })
);
