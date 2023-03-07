import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import type { Consumer } from "mediasoup-client/lib/types";

export const useConsumerStore = create(
  devtools(
    combine(
      {
        consumers: {} as Record<string, { consumer: Consumer; paused: boolean }>
      },
      (set) => ({
        add: (peer_id: string, consumer: Consumer, paused: boolean) =>
          set((state) => {
            return {
              consumers: {
                ...state.consumers,
                [peer_id]: {
                  consumer,
                  paused
                }
              }
            };
          }),

        remove: (peer_id: string) =>
          // @ts-ignore
          set((state) => {
            if (!state.consumers[peer_id]) return state;

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
    ),
    { name: "Consumer" }
  )
);
