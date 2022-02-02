import { Producer } from "mediasoup-client/lib/types";
import create from "zustand";
import { combine, devtools } from "zustand/middleware";

const store = combine(
  {
    producer: null as Producer | null,
    paused: false
  },
  (set) => ({
    set,
    add: (producer: Producer) =>
      set((state) => {
        if (state.producer && !state.producer.closed) {
          state.producer.close();
        }

        return { producer };
      }),
    reset: () =>
      set((state) => {
        state.producer?.close();

        return { producer: null, paused: false };
      }),
    setPaused: (paused: boolean) => set({ paused }),
    remove: () => set({ producer: null, paused: false })
  })
);

export const useProducerStore = create(
  devtools(store, { name: "ProducerStore" })
);
