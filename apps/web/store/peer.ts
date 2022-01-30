import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { User } from "types";

const store = combine(
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
        return {
          peers: {
            ...state.peers,
            [peer_id]: undefined
          }
        };
      })
  })
);

export const usePeerStore = create(devtools(store, { name: "PeerStore" }));
