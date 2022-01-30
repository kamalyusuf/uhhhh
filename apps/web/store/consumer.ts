import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { Consumer } from "mediasoup-client/lib/types";

const store = combine(
  {
    consumers: {} as Record<string, Consumer>
  },
  (set) => ({
    add: (peer_id: string, consumer: Consumer) =>
      set((state) => {
        return {
          consumers: {
            ...state.consumers,
            [peer_id]: consumer
          }
        };
      }),
    remove: (peer_id: string) =>
      set((state) => {
        return {
          consumers: {
            ...state.consumers,
            [peer_id]: undefined
          }
        };
      }),
    pause: (peer_id: string) =>
      set((state) => {
        const consumer = state.consumers[peer_id];
        if (consumer) consumer.pause();

        return state;
      }),
    resume: (peer_id: string) =>
      set((state) => {
        const consumer = state.consumers[peer_id];
        if (consumer) consumer.resume();

        return state;
      })
  })
);

export const useConsumerStore = create(
  devtools(store, { name: "ConsumerStore" })
);
