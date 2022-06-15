import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { User } from "types";

export const usePeerStore = create(
  devtools(
    combine(
      {
        peers: {} as Record<string, User>
      },
      (set, get) => ({
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
    { name: "PeerStore" }
  )
);
