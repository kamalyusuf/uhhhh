import { createstore } from "../utils/store";
import { produce } from "immer";
import type { Consumer } from "mediasoup-client/lib/types";

interface ConsumerStore {
  consumers: Record<
    string,
    { consumer: Consumer; paused: boolean; volume: number }
  >;

  add: (t: {
    peer_id: string;
    consumer: Consumer;
    paused: boolean;
    volume?: number;
  }) => void;

  remove: (peer_id: string) => void;
  pause: (peer_id: string) => void;
  resume: (peer_id: string) => void;
  setvolume: (peer_id: string, volume: number) => void;
}

export const useConsumerStore = createstore<ConsumerStore>(
  "Consumer",
  (set) => ({
    consumers: {},

    add: ({ consumer, paused, peer_id, volume = 100 }) =>
      set((state) => {
        return {
          consumers: {
            ...state.consumers,
            [peer_id]: {
              consumer,
              paused,
              volume
            }
          }
        };
      }),

    remove: (peer_id) =>
      set((state) =>
        produce(state, (draft) => {
          delete draft.consumers[peer_id];
        })
      ),

    pause: (peer_id) =>
      set((state) => {
        const c = state.consumers[peer_id];

        if (!c) return state;

        c.consumer.pause();

        return {
          consumers: {
            ...state.consumers,
            [peer_id]: {
              ...state.consumers[peer_id]!,
              paused: true
            }
          }
        };
      }),

    resume: (peer_id) =>
      set((state) => {
        const c = state.consumers[peer_id];

        if (!c) return state;

        c.consumer.resume();

        return {
          consumers: {
            ...state.consumers,
            [peer_id]: {
              ...state.consumers[peer_id]!,
              paused: false
            }
          }
        };
      }),

    setvolume: (peer_id, volume) =>
      set((state) => {
        const c = state.consumers[peer_id];

        if (!c) return state;

        return {
          consumers: {
            ...state.consumers,
            [peer_id]: {
              ...state.consumers[peer_id]!,
              volume
            }
          }
        };
      })
  })
);
