import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import type { User } from "types";

export const usePeerStore = create(
  devtools(
    combine(
      {
        peers: {} as Record<string, User>
      },
      (set) => ({
        add: (peer: User) =>
          set((state) => {
            return {
              peers: {
                ...state.peers,
                [peer._id]: peer
              }
            };
          }),

        remove: (peer_id: string) =>
          // @ts-ignore
          set((state) => {
            if (!state.peers[peer_id]) return state;

            return {
              peers: {
                ...state.peers,
                [peer_id]: undefined
              }
            };
          }),

        reset: () => set({ peers: {} })
      })
    ),
    { name: "Peer" }
  )
);
