import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { Consumer } from "mediasoup-client/lib/types";

const store = combine(
  {
    consumers: {} as Record<string, { consumer: Consumer; paused?: boolean }>
  },
  (set) => ({
    add: (peer_id: string, consumer: Consumer) =>
      set((state) => {
        return {
          consumers: {
            ...state.consumers,
            [peer_id]: {
              consumer
              // paused: consumer.paused
            }
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
        const c = state.consumers[peer_id];
        if (!c) return state;

        c.consumer.pause();

        return {
          consumers: {
            ...state.consumers,
            [peer_id]: {
              ...state.consumers[peer_id],
              paused: true
            }
          }
        };
      }),
    resume: (peer_id: string) =>
      set((state) => {
        const c = state.consumers[peer_id];
        if (!c) return state;

        c.consumer.resume();

        return {
          consumers: {
            ...state.consumers,
            [peer_id]: {
              ...state.consumers[peer_id],
              paused: false
            }
          }
        };
      })
  })
);

export const useConsumerStore = create(
  devtools(store, { name: "ConsumerStore" })
);
