import { Producer } from "mediasoup-client/lib/types";
import create from "zustand";
import { combine, devtools } from "zustand/middleware";

const store = combine(
  {
    producer: null as Producer | null
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
    remove: () => set({ producer: null })
  })
);

export const useProducerStore = create(
  devtools(store, { name: "ProducerStore" })
);
