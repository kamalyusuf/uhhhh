import type { Producer } from "mediasoup-client/lib/types";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

export const useProducerStore = create(
  devtools(
    combine(
      {
        producer: null as Producer | null,
        paused: false
      },
      (set) => ({
        set,
        add: (producer: Producer) =>
          set((state) => {
            if (state.producer && !state.producer.closed)
              state.producer.close();

            return { producer };
          }),

        reset: () =>
          set((state) => {
            state.producer?.close();

            return { producer: null, paused: false };
          }),

        setpaused: (paused: boolean) => set({ paused }),

        remove: () => set({ producer: null, paused: false })
      })
    ),
    { name: "Producer" }
  )
);
