import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { Consumer } from "mediasoup-client/lib/types";

const store = combine(
  {
    consumers: {} as Record<string, Consumer>
  },
  (set) => ({
    add: (consumer: Consumer, peer_id: string) =>
      set((state) => {
        return {
          consumers: {
            ...state.consumers,
            [peer_id]: consumer
          }
        };
      }),
    remove: (consumer_id: string) =>
      set((state) => {
        return {
          consumers: {
            ...state.consumers,
            [consumer_id]: undefined
          }
        };
      }),
    pause: (consumer_id: string) =>
      set((state) => {
        const consumer = state.consumers[consumer_id];
        if (consumer) consumer.pause();

        return state;
      }),
    resume: (consumer_id: string) =>
      set((state) => {
        const consumer = state.consumers[consumer_id];
        if (consumer) consumer.resume();

        return state;
      })
  })
);

export const useConsumerStore = create(
  devtools(store, { name: "ConsumerStore" })
);
